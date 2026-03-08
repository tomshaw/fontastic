import ConnectionManager from "./ConnectionManager";
import FontObject from "./FontObject";
import * as fs from "fs/promises";
import * as path from "path";
import { mimeTypes, installable } from "../config/mimes";

const prettyBytes = require("pretty-bytes");
const mime = require("mime");

export default class FontFinder {

  connectionManager: ConnectionManager;
  errors: any[] = [];
  counter: number = 0;

  constructor(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;
  }

  private isFontFile(filePath: string): boolean {
    const fileType = mime.getType(filePath);
    return fileType && mimeTypes.includes(fileType);
  }

  async scanFiles(files: string[], options: any) {
    for (const fp of files) {
      if (this.isFontFile(fp)) {
        const stat = await fs.stat(fp);
        await this.processFont(fp, stat, options);
      }
    }
  }

  async scanFolder(dir: string, options: any) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.scanFolder(fp, options);
      } else if (this.isFontFile(fp)) {
        const stat = await fs.stat(fp);
        await this.processFont(fp, stat, options);
      }
    }
  }

  private async processFont(fp: string, stat: any, options: any) {
    const font = new FontObject(fp);

    if (font.hasError()) {
      this.errors.push(font.getError());
      return;
    }

    const fileType = mime.getType(fp);

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
    } catch (err) {
      this.errors.push(err.message);
    }
  }
}
