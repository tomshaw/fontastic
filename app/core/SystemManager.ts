import { app } from 'electron';
import * as os from 'os';
import * as path from 'path';

import { systemFontsPaths } from "../config/system";

const isDev = require('electron-is-dev');

const root = process.cwd();

export default class ConfigManager {

  machineId: string;

  constructor(machineId: string) {
    this.machineId = machineId;
  }

  isDev() {
    return isDev;
  }

  isProduction() {
    return !this.isDev();
  }

  x86() {
    return process.arch === 'ia32'
  }

  x64() {
    return process.arch === 'x64'
  }

  macOS() {
    return process.platform === 'darwin'
  }

  windows() {
    return process.platform === 'win32';
  }

  linux() {
    return process.platform === 'linux'
  }

  getLocale() {
    return app.getLocale();
  }

  getPath(name: any | string) {
    return app.getPath(name);
  }

  getPathDir(loc: string) {
    return path.dirname(loc)
  }

  getCachePath(): string {
    return app.getPath('sessionData');
  }

  getAppDataPath(): string {
    return app.getPath('appData');
  }

  getUserDataPath(): string {
    return app.getPath('userData');
  }

  getDownloadsPath(): string {
    return app.getPath('downloads');
  }

  getErrorLogPath(): string {
    const name = this.isDev() ? 'dev.dat' : 'pro.dat'
    return path.resolve(this.getUserDataPath(), `./${name}`)
  }

  getSessionPath(): string {
    return path.resolve(this.getUserDataPath(), './Session')
  }

  getDatabasePath(file: string) {
    return path.join(this.getUserDataPath(), 'Database', file);
  }

  getUserDataFile(file: string) {
    return path.join(this.getUserDataPath(), file);
  }

  getTempDirFile(file: string) {
    return path.join(os.tmpdir(), file);
  }

  getSystemFontsPath() {
    return systemFontsPaths.get(this.getPlatform());
  }

  getUpTime() {
    let sec = os.uptime();
    let min = sec / 60;
    let hour = min / 60;

    return  {
      ts: sec,
      hours: Math.floor(hour) % 60,
      minutes: Math.floor(min) % 60,
      seconds: Math.floor(sec) % 60
    }
  }

  getPlatform() {
    switch (os.platform()) {
      case 'aix':
      case 'freebsd':
      case 'linux':
      case 'openbsd':
      case 'android':
        return 'unix';
      case 'darwin':
      case 'sunos':
        return 'mac';
      case 'win32':
        return 'win';
    }
  }

  getBinaryName() {
    let platform = this.getPlatform();
    return (platform === 'win') ? 'activator.exe' : 'activator';
  }

  getBinaryPath(binaryName: string) {
    const binaryPath = this.isProduction() ? path.join(root, 'resources', 'bin') : path.join(root, 'src', 'bin');
    return path.resolve(path.join(binaryPath, binaryName));
  }

  toArray() {
    return {
      'is_dev': this.isDev(),
      'is_production': this.isProduction(),
      'is_x86': this.x86(),
      'is_x64': this.x64(),
      'is_mac': this.macOS(),
      'is_windows': this.windows(),
      'is_linux': this.linux(),
      'locale': this.getLocale(),
      'cache_path': this.getCachePath(),
      'app_data_path': this.getAppDataPath(),
      'user_data_path': this.getUserDataPath(),
      'downloads_path': this.getDownloadsPath(),
      'error_log_path': this.getErrorLogPath(),
      'session_path': this.getSessionPath()
    }
  }
}
