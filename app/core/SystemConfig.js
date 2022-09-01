"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const Store = require('electron-store');
const is = require('electron-is');
const os = require("os");
const path = require("path");
const channel = require("../config");
class SystemConfig {
    constructor() {
        this.store = new Store();
    }
    set(values) {
        return this.store.set(values);
    }
    get(key = null) {
        if (key) {
            return this.store.get(key);
        }
        return this.store;
    }
    has(key) {
        return this.store.has(key);
    }
    const(name) {
        return channel[name];
    }
    isDev() {
        return is.dev();
    }
    isProduction() {
        return is.production();
    }
    x86() {
        return is.x86();
    }
    x64() {
        return is.x64();
    }
    macOS() {
        return is.macOS();
    }
    windows() {
        return is.windows();
    }
    linux() {
        return is.linux();
    }
    getLocale() {
        return electron_1.app.getLocale();
    }
    getPath(name) {
        return electron_1.app.getPath(name);
    }
    getAppDataPath() {
        return electron_1.app.getPath('appData');
    }
    getUserDataPath() {
        return electron_1.app.getPath('userData');
    }
    getCachePath() {
        return electron_1.app.getPath('cache');
    }
    getDownloadsPath() {
        return electron_1.app.getPath('downloads');
    }
    getErrorLogPath() {
        const name = is.dev() ? 'dev.dat' : 'pro.dat';
        return path.resolve(electron_1.app.getPath('userData'), `./${name}`);
    }
    getSessionPath() {
        return path.resolve(electron_1.app.getPath('userData'), './session');
    }
    getDefaultDatabase(file) {
        return path.join(electron_1.app.getPath('userData'), 'db', file);
    }
    getUserDataFile(file) {
        return path.join(electron_1.app.getPath('userData'), file);
    }
    getTempDirFile(file) {
        return path.join(os.tmpdir(), file);
    }
}
exports.default = SystemConfig;
//# sourceMappingURL=SystemConfig.js.map