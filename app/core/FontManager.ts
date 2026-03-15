import { app, dialog, BrowserWindow, shell } from 'electron';

import SystemManager from './SystemManager';
import ConfigManager from './ConfigManager';
import ConnectionManager from './ConnectionManager';

import FontCatalog from './FontCatalog';
import FontFinder, { ProgressCallback } from './FontFinder';
import { execute } from '../helpers/command';

import { StorageType } from '../enums/StorageType';

import * as path from 'path';

const fetch = require('node-fetch');

export default class FontManager {
  systemManager: SystemManager;
  configManager: ConfigManager;
  connectionManager: ConnectionManager;
  private catalog = new FontCatalog();

  constructor(systemManager: SystemManager, configManager: ConfigManager, connectionManager: ConnectionManager) {
    this.systemManager = systemManager;
    this.configManager = configManager;
    this.connectionManager = connectionManager;
  }

  async fetchLatestNews(args: any) {
    // Retrieve API key securely from main process storage
    let apiKey = args.apiKey;
    if (!apiKey) {
      const secureKey = this.configManager.getSecure('secure.news.apiKey');
      if (secureKey) {
        apiKey = secureKey;
      }
    }
    if (!apiKey) return { articles: [] };

    const endpoint = `https://newsapi.org/v2/top-headlines?country=${args.country || 'us'}&apiKey=${apiKey}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    if (data?.articles) {
      this.configManager.set(StorageType.News, {
        ...this.configManager.get(StorageType.News),
        articles: data.articles,
        ts: Date.now(),
      });
    }
    return data;
  }

  async systemAuthenticate(args: any) {
    args.status = 'ok';
    this.configManager.set(StorageType.User, args);
    return this.configManager.get(StorageType.User);
  }

  async executeCommand(args: any) {
    try {
      return await execute(args.cmd, args.options);
    } catch (err) {
      return err;
    }
  }

  getDestinationFolder(collectionId: number) {
    return path.join(this.systemManager.getCatalogPath(), String(collectionId));
  }

  async copyFiles(files: string[], collectionId: number): Promise<string[]> {
    const dest = this.getDestinationFolder(collectionId);
    await this.catalog.copyFiles(files, dest);
    return files.map((file) => path.join(dest, path.basename(file)));
  }

  async copyFolder(src: string, collectionId: number): Promise<string> {
    const dest = this.getDestinationFolder(collectionId);
    await this.catalog.copyFolder(src, dest);
    return dest;
  }

  async scanFiles(files: string[], options: any, onProgress?: ProgressCallback) {
    const finder = new FontFinder(this.connectionManager, onProgress);
    await finder.scanFiles(files, options);
  }

  async scanFolder(dir: string, options: any, onProgress?: ProgressCallback) {
    const finder = new FontFinder(this.connectionManager, onProgress);
    await finder.scanFolder(dir, options);
  }

  showMessageBox(options: any) {
    return dialog.showMessageBox(null, options);
  }

  showOpenDialog(options: any) {
    return dialog.showOpenDialog(options);
  }

  beep() {
    return shell.beep();
  }

  openPath(path: string) {
    shell.openPath(path);
  }

  openExternal(url: string) {
    shell.openExternal(url);
  }

  showItemInFolder(fullPath: string) {
    shell.showItemInFolder(fullPath);
  }

  reLaunch() {
    app.relaunch();
    app.quit();
  }

  exit() {
    app.exit();
  }

  quit() {
    app.quit();
  }

  reloadWindow() {
    const windows = BrowserWindow.getAllWindows();
    if (windows && windows.length) {
      for (const win of windows) {
        win.webContents.reloadIgnoringCache();
      }
    }
  }
}
