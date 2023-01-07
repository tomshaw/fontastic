import { app, dialog, BrowserWindow, shell } from 'electron';

import SystemManager from './SystemManager';
import ConfigManager from './ConfigManager';
import ConnectionManager from './ConnectionManager';

import FontCatalog from './FontCatalog';
import FontFinder from './FontFinder';
import FontInstaller from './FontInstaller';

import { execute } from '../helpers/command';
import { randNumber } from '../helpers/random';

import * as constants from '../config/constants';

import * as path from 'path';

const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

export default class FontManager {

  systemManager: SystemManager;
  configManager: ConfigManager;
  connectionManager: ConnectionManager;

  constructor(
    systemManager: SystemManager,
    configManager: ConfigManager,
    connectionManager: ConnectionManager
  ) {
    this.setSystemManager(systemManager);
    this.setConfigManager(configManager);
    this.setConnectionManager(connectionManager);
  }

  setSystemManager(systemManager: SystemManager) {
    this.systemManager = systemManager;
  }

  getSystemManager(): SystemManager {
    return this.systemManager;
  }

  setConfigManager(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  getConfigManager(): ConfigManager {
    return this.configManager;
  }

  setConnectionManager(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;
  }

  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  async fetchLatestNews(args: any) {
    const response = await fetch(args.endpoint);
    return await response.json();
  }

  async fetchNewsContent(url: string) {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/94.0'
      }
    });
    if (!res.ok) {
      console.error(await res.text());
    }
    const body = await res.text();
    const dom = new JSDOM(body);
    const reader = new Readability(dom.window.document).parse();

    return reader;
  }

  async systemAuthenticate(args: any) {
    args.status = 'ok';
    this.getConfigManager().set(constants.STORE_USER, args);
    return this.getConfigManager().get(constants.STORE_USER);
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
      let finder = new FontFinder(this.getConnectionManager());
      finder.scanFiles(files, options, (err: any) => {
        if (err) { return reject(err); }
        return resolve({});
      });
    });
  }

  scanFolders(dir: any, options: any) {
    return new Promise((resolve, reject) => {
      let finder = new FontFinder(this.getConnectionManager());
      finder.scanFolders(dir, options, (err: any) => {
        if (err) { return reject(err); }
        return resolve({});
      });
    });
  }

  fontInstaller(options: any) {
    let installer = new FontInstaller(this.getSystemManager(), this.getConnectionManager());
    return installer.activate(options);
  }

  getMapFilePaths(files: string[], dest: string) {
    return files.map((file: string) => dest + path.sep + path.basename(file));
  }

  getSourceFolder(sourceFolder: string) {
    return path.normalize(sourceFolder);
  }

  getDestinationFolder() {
    return path.normalize(this.getSystemManager().getCatalogPath() + path.sep + Date.now() + randNumber(7));
  }

  getSourceDestinationFolders(sourceFolder: string) {
    const src = this.getSourceFolder(sourceFolder);
    const dest = this.getDestinationFolder();
    return { src, dest }
  }

  createCatalog(folder: string) {
    const catalog = new FontCatalog(this.getSystemManager());
    return catalog.createCatalog(folder);
  }

  async copyFiles(files: string[], dest: string) {
    return new Promise((resolve, reject) => {
      const catalog = new FontCatalog(this.getSystemManager());
      catalog.copyFiles(files, dest, (err: any, stdout: any) => {
        if (err) { return reject(err); }
        return resolve({});
      });
    });
  }

  async copyFolders(src: string, dest: string) {
    return new Promise((resolve, reject) => {
      const catalog = new FontCatalog(this.getSystemManager());
      catalog.copyFolders(src, dest, (err: any, stdout: any) => {
        if (err) { return reject(err); }
        return resolve({});
      });
    });
  }

  showDialogBox(options: any) {
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
