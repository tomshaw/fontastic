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
const command_1 = require("../helpers/command");
const StorageType_1 = require("../enums/StorageType");
const path = require("path");
const fetch = require('node-fetch');
class FontManager {
    constructor(systemManager, configManager, connectionManager) {
        this.catalog = new FontCatalog_1.default();
        this.systemManager = systemManager;
        this.configManager = configManager;
        this.connectionManager = connectionManager;
    }
    fetchLatestNews(args) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve API key securely from main process storage
            let apiKey = args.apiKey;
            if (!apiKey) {
                const secureKey = this.configManager.getSecure('secure.news.apiKey');
                if (secureKey) {
                    apiKey = secureKey;
                }
            }
            if (!apiKey)
                return { articles: [] };
            const endpoint = `https://newsapi.org/v2/top-headlines?country=${args.country || 'us'}&apiKey=${apiKey}`;
            const response = yield fetch(endpoint);
            const data = yield response.json();
            if (data === null || data === void 0 ? void 0 : data.articles) {
                this.configManager.set(StorageType_1.StorageType.News, Object.assign(Object.assign({}, this.configManager.get(StorageType_1.StorageType.News)), { articles: data.articles, ts: Date.now() }));
            }
            return data;
        });
    }
    systemAuthenticate(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args.status = 'ok';
            this.configManager.set(StorageType_1.StorageType.User, args);
            return this.configManager.get(StorageType_1.StorageType.User);
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
    getDestinationFolder(collectionId) {
        return path.join(this.systemManager.getCatalogPath(), String(collectionId));
    }
    copyFiles(files, collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dest = this.getDestinationFolder(collectionId);
            yield this.catalog.copyFiles(files, dest);
            return files.map((file) => path.join(dest, path.basename(file)));
        });
    }
    copyFolder(src, collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dest = this.getDestinationFolder(collectionId);
            yield this.catalog.copyFolder(src, dest);
            return dest;
        });
    }
    scanFiles(files, options, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const finder = new FontFinder_1.default(this.connectionManager, onProgress);
            yield finder.scanFiles(files, options);
        });
    }
    scanFolder(dir, options, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const finder = new FontFinder_1.default(this.connectionManager, onProgress);
            yield finder.scanFolder(dir, options);
        });
    }
    showMessageBox(options) {
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