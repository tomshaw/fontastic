import SystemManager from './SystemManager';
import ConfigManager from './ConfigManager';
import * as fs from 'fs/promises';

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
    const dest = path.normalize(appPath + path.sep + 'dist' + path.sep + 'catalog' + path.sep + Date.now());

    return { src, dest }
  }

  async createCatalog(folder: string) {
    return await fs.mkdir(folder, { recursive: true });
  }

  async commandHelp() {
    return await child(this.getPathExecutable(), ['-h'], (err: any, data: any) => {
      console.log('child-error', err)
      console.log('child-data', data.toString());
    });
  }

  async findFonts(src: string) {
    return await child(this.getPathExecutable(), ['fonts', 'find', '--root', src], (err: any, data: any) => {
      console.log('child-error', err)
      console.log('child-data', data.toString());
    });
  }

  async copyFonts(src: string, dest: string, done: any) {
    const parameters = ['fonts', 'copyf', '--source', src, '--destination', dest];

    return await child(this.getPathExecutable(), parameters, {}, done);
  }
}
