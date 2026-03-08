import { app, dialog, BrowserWindow, shell } from 'electron';

import SystemManager from './SystemManager';
import ConfigManager from './ConfigManager';
import ConnectionManager from './ConnectionManager';

import FontCatalog from './FontCatalog';
import FontFinder from './FontFinder';
import { execute } from '../helpers/command';

import { StorageType } from '../enums/StorageType';

import * as path from 'path';

const fetch = require('node-fetch');

export default class FontManager {
  systemManager: SystemManager;
  configManager: ConfigManager;
  connectionManager: ConnectionManager;

  constructor(systemManager: SystemManager, configManager: ConfigManager, connectionManager: ConnectionManager) {
    this.systemManager = systemManager;
    this.configManager = configManager;
    this.connectionManager = connectionManager;
  }

  async fetchLatestNews(args: any) {
    const response = await fetch(args.endpoint);
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
    console.log('[FontManager.copyFiles] dest:', dest, 'files:', files);
    const catalog = new FontCatalog();
    await catalog.copyFiles(files, dest);
    const catalogFiles = files.map((file) => path.join(dest, path.basename(file)));
    console.log('[FontManager.copyFiles] catalogFiles:', catalogFiles);
    return catalogFiles;
  }

  async copyFolder(src: string, collectionId: number): Promise<string> {
    const dest = this.getDestinationFolder(collectionId);
    console.log('[FontManager.copyFolder] src:', src, 'dest:', dest);
    const catalog = new FontCatalog();
    await catalog.copyFolder(src, dest);
    return dest;
  }

  async scanFiles(files: string[], options: any) {
    console.log('[FontManager.scanFiles] files:', files, 'options:', options);
    const finder = new FontFinder(this.connectionManager);
    await finder.scanFiles(files, options);
    console.log('[FontManager.scanFiles] done, processed:', finder.counter, 'errors:', finder.errors);
  }

  async scanFolder(dir: string, options: any) {
    console.log('[FontManager.scanFolder] dir:', dir, 'options:', options);
    const finder = new FontFinder(this.connectionManager);
    await finder.scanFolder(dir, options);
    console.log('[FontManager.scanFolder] done, processed:', finder.counter, 'errors:', finder.errors);
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
