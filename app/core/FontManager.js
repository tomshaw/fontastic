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
const electron_1 = require("electron");
const FontCatalog_1 = require("./FontCatalog");
const FontFinder_1 = require("./FontFinder");
const FontInstaller_1 = require("./FontInstaller");
const command_1 = require("../helpers/command");
const random_1 = require("../helpers/random");
const path = require('path');
const fetch = require("node-fetch");
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
class FontManager {
    constructor(systemManager, configManager, connectionManager) {
        this.setSystemManager(systemManager);
        this.setConfigManager(configManager);
        this.setConnectionManager(connectionManager);
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
    setConnectionManager(connectionManager) {
        this.connectionManager = connectionManager;
    }
    getConnectionManager() {
        return this.connectionManager;
    }
    fetchLatestNews(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(args.endpoint);
            return yield response.json();
        });
    }
    fetchNewsContent(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/94.0'
                }
            });
            if (!res.ok) {
                console.error(yield res.text());
            }
            const body = yield res.text();
            const dom = new JSDOM(body);
            const reader = new Readability(dom.window.document).parse();
            //console.log('reader', reader.textContent);
            return reader;
        });
    }
    systemAuthenticate(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args.status = "ok";
            this.getConfigManager().set("ACCOUNT", args);
            return this.getConfigManager().get("ACCOUNT");
        });
    }
    executeCommand(args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield (0, command_1.execute)(args.cmd, args.options);
            }
            catch (err) {
                return err;
            }
        });
    }
    scanFiles(dir, options, done) {
        let finder = new FontFinder_1.default(this.getConnectionManager());
        return finder.scanFiles(dir, options, done);
    }
    scanFolders(dir, options) {
        return new Promise((resolve, reject) => {
            let finder = new FontFinder_1.default(this.getConnectionManager());
            finder.scanFolders(dir, options, (err, stdout) => {
                if (err) {
                    return reject(err);
                }
                return resolve({});
            });
        });
    }
    fontInstaller(options) {
        let installer = new FontInstaller_1.default(this.getSystemManager(), this.getConnectionManager());
        return installer.activate(options);
    }
    getSourceFolder(sourceFolder) {
        return path.normalize(sourceFolder);
    }
    getDestinationFolder() {
        return path.normalize(this.getSystemManager().getCatalogPath() + path.sep + Date.now() + (0, random_1.randNumber)(7));
    }
    getSourceDestinationFolders(sourceFolder) {
        const src = this.getSourceFolder(sourceFolder);
        const dest = this.getDestinationFolder();
        return { src, dest };
    }
    createCatalog(folder) {
        const catalog = new FontCatalog_1.default(this.getSystemManager());
        return catalog.createCatalog(folder);
    }
    copyFiles(files, dest) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const catalog = new FontCatalog_1.default(this.getSystemManager());
                catalog.copyFiles(files, dest, (err, stdout) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve({});
                });
            });
        });
    }
    copyFolders(src, dest) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const catalog = new FontCatalog_1.default(this.getSystemManager());
                catalog.copyFolders(src, dest, (err, stdout) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve({});
                });
            });
        });
    }
    showDialogBox(options) {
        return electron_1.dialog.showMessageBox(null, options);
    }
    showOpenDialog(options) {
        return electron_1.dialog.showOpenDialog(options);
    }
    beep() {
        return electron_1.shell.beep();
    }
    openPath(path) {
        electron_1.shell.openPath(path);
    }
    openExternal(url) {
        electron_1.shell.openExternal(url);
    }
    showItemInFolder(fullPath) {
        electron_1.shell.showItemInFolder(fullPath);
    }
    reLaunch() {
        electron_1.app.relaunch();
        electron_1.app.quit();
    }
    exit() {
        electron_1.app.exit();
    }
    quit() {
        electron_1.app.quit();
    }
    reloadWindow() {
        const windows = electron_1.BrowserWindow.getAllWindows();
        if (windows && windows.length) {
            for (const win of windows) {
                win.webContents.reloadIgnoringCache();
            }
        }
    }
}
exports.default = FontManager;
//# sourceMappingURL=FontManager.js.map