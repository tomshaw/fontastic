"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const os = require("os");
const path = require("path");
const system_1 = require("../config/system");
const root = process.cwd();
class ConfigManager {
    constructor(machineId, isProduction) {
        this.machineId = machineId;
        this.isProduction = isProduction;
    }
    x86() {
        return process.arch === 'ia32';
    }
    x64() {
        return process.arch === 'x64';
    }
    macOS() {
        return process.platform === 'darwin';
    }
    windows() {
        return process.platform === 'win32';
    }
    linux() {
        return process.platform === 'linux';
    }
    getLocale() {
        return electron_1.app.getLocale();
    }
    getPath(name) {
        return electron_1.app.getPath(name);
    }
    getPathDir(str) {
        return path.dirname(str);
    }
    getPathBase(str) {
        return path.basename(str);
    }
    getAppPath() {
        return electron_1.app.getAppPath();
    }
    getCatalogPath() {
        return path.join(this.getUserDataPath(), 'catalog');
    }
    getCachePath() {
        return electron_1.app.getPath('sessionData');
    }
    getAppDataPath() {
        return electron_1.app.getPath('appData');
    }
    getUserDataPath() {
        return electron_1.app.getPath('userData');
    }
    getDownloadsPath() {
        return electron_1.app.getPath('downloads');
    }
    getSessionPath() {
        return path.resolve(this.getUserDataPath(), './Session');
    }
    getDatabasePath(file) {
        return path.join(this.getUserDataPath(), 'Database', file);
    }
    getUserDataFile(file) {
        return path.join(this.getUserDataPath(), file);
    }
    getTempDirFile(file) {
        return path.join(os.tmpdir(), file);
    }
    getPlatformFontPaths() {
        return system_1.systemFontPaths.get(this.getPlatform());
    }
    getUpTime() {
        let sec = os.uptime();
        let min = sec / 60;
        let hour = min / 60;
        return {
            ts: sec,
            hours: Math.floor(hour) % 60,
            minutes: Math.floor(min) % 60,
            seconds: Math.floor(sec) % 60
        };
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
    getAppVersion() {
        return electron_1.app.getVersion();
    }
    getElectronVersion() {
        return process.versions.electron;
    }
    getBinaryName() {
        return (this.getPlatform() === 'win') ? 'activator.exe' : 'activator';
    }
    getBinaryPath() {
        return this.isProduction ? path.join(this.getAppPath(), '..', 'bin') : path.join(root, 'src', 'bin');
    }
    getExecutable() {
        return path.resolve(path.join(this.getBinaryPath(), this.getBinaryName()));
    }
    toArray() {
        return {
            'uptime': this.getUpTime(),
            'locale': this.getLocale(),
            'is_dev': !this.isProduction,
            'is_production': this.isProduction,
            'is_x86': this.x86(),
            'is_x64': this.x64(),
            'is_mac': this.macOS(),
            'is_windows': this.windows(),
            'is_linux': this.linux(),
            'cache_path': this.getCachePath(),
            'app_path': this.getAppPath(),
            'app_data_path': this.getAppDataPath(),
            'user_data_path': this.getUserDataPath(),
            'downloads_path': this.getDownloadsPath(),
            'session_path': this.getSessionPath(),
            'catalog_path': this.getCatalogPath(),
            'version': {
                'system': this.getAppVersion(),
                'electron': this.getElectronVersion(),
            }
        };
    }
}
exports.default = ConfigManager;
//# sourceMappingURL=SystemManager.js.map