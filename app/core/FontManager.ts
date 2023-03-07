import { app, dialog, BrowserWindow, shell } from 'electron';

import SystemManager from './SystemManager';
import ConfigManager from './ConfigManager';
import ConnectionManager from './ConnectionManager';

import FontCatalog from './FontCatalog';
import FontFinder from './FontFinder';
import FontInstaller from './FontInstaller';

import { execute } from '../helpers/command';
import { randNumber } from '../helpers/random';

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
    return await response.json();
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

  scanFiles(files: string[], options: any) {
    return new Promise((resolve, reject) => {
      let finder = new FontFinder(this.connectionManager);
      finder.scanFiles(files, options, (err: any) => {
        if (err) { return reject(err); }
        return resolve({});
      });
    });
  }

  scanFolders(dir: any, options: any) {
    return new Promise((resolve, reject) => {
      let finder = new FontFinder(this.connectionManager);
      finder.scanFolders(dir, options, (err: any) => {
        if (err) { return reject(err); }
        return resolve({});
      });
    });
  }

  fontInstaller(options: any) {
    let installer = new FontInstaller(this.systemManager, this.connectionManager);
    return installer.activate(options);
  }

  /**
   * @todo
   */
  folderInstaller(options: any) {
    let installer = new FontInstaller(this.systemManager, this.connectionManager);
    return installer.activate(options);
  }

  getMapFilePaths(files: string[], dest: string) {
    return files.map((file: string) => dest + path.sep + path.basename(file));
  }

  getSourceFolder(sourceFolder: string) {
    return path.normalize(sourceFolder);
  }

  getDestinationFolder() {
    return path.normalize(this.systemManager.getCatalogPath() + path.sep + Date.now() + randNumber(7));
  }

  getSourceDestinationFolders(sourceFolder: string) {
    const src = this.getSourceFolder(sourceFolder);
    const dest = this.getDestinationFolder();
    return { src, dest }
  }

  createCatalog(folder: string) {
    const catalog = new FontCatalog(this.systemManager);
    return catalog.createCatalog(folder);
  }

  async copyFiles(files: string[], dest: string) {
    return new Promise((resolve, reject) => {
      const catalog = new FontCatalog(this.systemManager);
      catalog.copyFiles(files, dest, (err: any, stdout: any) => {
        if (err) { return reject(err); }
        return resolve({});
      });
    });
  }

  async copyFolders(src: string, dest: string) {
    return new Promise((resolve, reject) => {
      const catalog = new FontCatalog(this.systemManager);
      catalog.copyFolders(src, dest, (err: any, stdout: any) => {
        if (err) { return reject(err); }
        return resolve({});
      });
    });
  }

  showMessageBox(options: any) {
    return dialog.showMessageBox(null, options);
  }

  showOpenDialog(options: any) {
    return dialog.showOpenDialog(options);
  }

  beep() {
    return shell.beep()
  }

  openPath(path: string) {
    shell.openPath(path)
  }

  openExternal(url: string) {
    shell.openExternal(url)
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
