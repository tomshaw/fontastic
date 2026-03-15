import ConnectionManager from './ConnectionManager';
import FontObject from './FontObject';
import * as fs from 'fs/promises';
import * as path from 'path';
import { mimeTypes, installable } from '../config/mimes';
import type { ScanProgress } from '../types';

const prettyBytes = require('pretty-bytes');
const mime = require('mime');

const SCAN_CONCURRENCY = 10;

export type ProgressCallback = (progress: ScanProgress) => void;

export default class FontFinder {
  connectionManager: ConnectionManager;
  errors: any[] = [];
  counter: number = 0;
  private onProgress: ProgressCallback | null = null;

  constructor(connectionManager: ConnectionManager, onProgress?: ProgressCallback) {
    this.connectionManager = connectionManager;
    this.onProgress = onProgress ?? null;
  }

  private getFontMimeType(filePath: string): string | null {
    const fileType = mime.getType(filePath);
    return fileType && mimeTypes.includes(fileType) ? fileType : null;
  }

  async scanFiles(files: string[], options: any) {
    this.errors = [];
    this.counter = 0;

    const fontFiles: { fp: string; fileType: string }[] = [];
    for (const fp of files) {
      const fileType = this.getFontMimeType(fp);
      if (fileType) {
        fontFiles.push({ fp, fileType });
      }
    }

    await this.processInBatches(fontFiles, options);
  }

  async scanFolder(dir: string, options: any) {
    this.errors = [];
    this.counter = 0;

    const fontFiles = await this.collectFontFiles(dir);
    await this.processInBatches(fontFiles, options);
  }

  private async collectFontFiles(dir: string): Promise<{ fp: string; fileType: string }[]> {
    const results: { fp: string; fileType: string }[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const subdirPromises: Promise<{ fp: string; fileType: string }[]>[] = [];

    for (const entry of entries) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        subdirPromises.push(this.collectFontFiles(fp));
      } else {
        const fileType = this.getFontMimeType(fp);
        if (fileType) {
          results.push({ fp, fileType });
        }
      }
    }

    if (subdirPromises.length > 0) {
      const subdirResults = await Promise.all(subdirPromises);
      for (const subResults of subdirResults) {
        results.push(...subResults);
      }
    }

    return results;
  }

  private async processInBatches(fontFiles: { fp: string; fileType: string }[], options: any) {
    const total = fontFiles.length;
    for (let i = 0; i < fontFiles.length; i += SCAN_CONCURRENCY) {
      const batch = fontFiles.slice(i, i + SCAN_CONCURRENCY);
      await Promise.all(batch.map(({ fp, fileType }) => this.processFont(fp, fileType, options)));

      if (this.onProgress) {
        const lastFile = batch[batch.length - 1];
        this.onProgress({
          processed: Math.min(i + SCAN_CONCURRENCY, total),
          total,
          currentFile: path.basename(lastFile.fp),
          errors: this.errors.length,
        });
      }
    }
  }

  private async processFont(fp: string, fileType: string, options: any) {
    const font = new FontObject(fp);

    if (font.hasError()) {
      this.errors.push(font.getError());
      return;
    }

    let stat;
    try {
      stat = await fs.stat(fp);
    } catch (err: any) {
      this.errors.push({ file: fp, message: err.message });
      return;
    }

    const data = {
      file_path: fp,
      file_name: path.basename(fp),
      file_size: stat.size,
      file_size_pretty: prettyBytes(stat.size),
      file_type: fileType,
      installable: installable.includes(fileType),
      ...options,
      ...font.getNamesTable(),
    };

    try {
      await this.connectionManager.getStoreRepository().create(data);
      this.counter++;
    } catch (err: any) {
      this.errors.push({ file: fp, message: err.message });
    }
  }
}
