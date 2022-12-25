"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs/promises");
const electron_log_1 = require("electron-log");
const path = require('path');
const child = require('child_process').execFile;
class FontCatalog {
    constructor(systemManager, configManager) {
        this.setSystemManager(systemManager);
        this.setConfigManager(configManager);
    }
    setSystemManager(systemManager) {
        this.systemManager = systemManager;
    }
    getSystemManager() {
        return this.systemManager;
    }
    setConfigManager(configManager) {
        this.configManager = configManager;
    }
    getConfigManager() {
        return this.configManager;
    }
    getPathExecutable() {
        const name = this.getSystemManager().getBinaryName();
        return this.getSystemManager().getBinaryPath(name);
    }
    getFolders(sourceFolder) {
        const appPath = this.getSystemManager().getAppPath();
        const execPath = this.getPathExecutable();
        const src = path.normalize(sourceFolder);
        //const dest = path.normalize(appPath + path.sep + 'resources' + path.sep + 'dist' + path.sep + 'catalog' + path.sep + Date.now());
        const dest = path.normalize(appPath + path.sep + '..' + path.sep + 'catalog' + path.sep + Date.now());
        electron_log_1.default.info(appPath);
        electron_log_1.default.info(dest);
        return { src, dest };
    }
    createCatalog(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fs.mkdir(folder, { recursive: true });
        });
    }
    commandHelp() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield child(this.getPathExecutable(), ['-h'], (err, data) => {
                console.log('child-error', err);
                console.log('child-data', data.toString());
            });
        });
    }
    findFonts(src) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield child(this.getPathExecutable(), ['fonts', 'find', '--root', src], (err, data) => {
                console.log('child-error', err);
                console.log('child-data', data.toString());
            });
        });
    }
    copyFonts(src, dest, done) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = ['fonts', 'copyf', '--source', src, '--destination', dest];
            return yield child(this.getPathExecutable(), parameters, {}, done);
        });
    }
}
exports.default = FontCatalog;
//# sourceMappingURL=FontCatalog.js.map