import { app, dialog, BrowserWindow, shell } from "electron";

import SystemManager from "./SystemManager";
import ConfigManager from "./ConfigManager";
import ConnectionManager from "./ConnectionManager";

import FontFinder from "./FontFinder";
import FontInstaller from "./FontInstaller";

import { execute } from "../helpers/command"

const fetch = require("node-fetch");

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

  async systemAuthenticate(args: any) {
    args.status = "ok";
    this.getConfigManager().set("ACCOUNT", args);
    return this.getConfigManager().get("ACCOUNT");
  }

  async executeCommand(args: any) {
    try {
      return await execute(args.cmd, args.options);
    } catch (err) {
      return err;
    }
  }

  scanFiles(dir: any, options: any, done: any) {
    let finder = new FontFinder(this.getConnectionManager());
    return finder.scanFiles(dir, options, done);
  }

  scanFolders(dir: any, options: any, done: any) {
    let finder = new FontFinder(this.getConnectionManager());
    return finder.scanFolders(dir, options, done);
  }

  fontInstaller(options: any, done: any) {
    let installer = new FontInstaller(this.getSystemManager(), this.getConnectionManager());
    return installer.activate(options, done);
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
