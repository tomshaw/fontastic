import SystemManager from './SystemManager';
import ConfigManager from './ConfigManager';
import * as fs from 'fs/promises';
import log from 'electron-log';

const path = require('path');
const child = require('child_process').execFile;

export default class FontCatalog {

  systemManager: SystemManager;
  configManager: ConfigManager;

  constructor(
    systemManager: SystemManager,
    configManager: ConfigManager,
  ) {
    this.setSystemManager(systemManager);
    this.setConfigManager(configManager);
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

  getPathExecutable(): string {
    const name = this.getSystemManager().getBinaryName()
    return this.getSystemManager().getBinaryPath(name);
  }

  getFolders(sourceFolder: string) {
    const appPath = this.getSystemManager().getAppPath();

    const src = path.normalize(sourceFolder);
    const dest = this.getSystemManager().isProduction() ? 
      path.normalize(appPath + path.sep + '..' + path.sep + 'catalog' + path.sep + Date.now()) :
      path.normalize(appPath + path.sep + 'dist' + path.sep + 'catalog' + path.sep + Date.now()); 

    log.info(appPath);
    log.info(dest);

    return { src, dest }
  }

  async createCatalog(folder: string) {
    return await fs.mkdir(folder, { recursive: true });
  }

  async commandHelp(done: any) {
    return await child(this.getPathExecutable(), ['-h'], done);
  }

  async findFonts(src: string, done: any) {
    return await child(this.getPathExecutable(), ['fonts', 'find', '--root', src], done);
  }

  async copyFonts(src: string, dest: string, done: any) {
    const params = ['fonts', 'copyf', '--source', src, '--destination', dest];

    return await child(this.getPathExecutable(), params, done);
  }
}
