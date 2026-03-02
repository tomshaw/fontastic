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
const FontFinder_1 = require("./FontFinder");
const child_process_1 = require("child_process");
const sudo = require('sudo-prompt');
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
    scanFiles(dir, options, done) {
        let finder = new FontFinder_1.default(this.getConnectionManager());
        return finder.scanFiles(dir, options, done);
    }
    scanFolders(dir, options, done) {
        let finder = new FontFinder_1.default(this.getConnectionManager());
        return finder.scanFolders(dir, options, done);
    }
    exec(cmd_1) {
        return __awaiter(this, arguments, void 0, function* (cmd, options = {}) {
            return new Promise((resolve, reject) => {
                (0, child_process_1.exec)(cmd, options, (err, stdout, stderr) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve({ stdout, stderr });
                });
            });
        });
    }
    sudo(cmd_1) {
        return __awaiter(this, arguments, void 0, function* (cmd, options = {}) {
            return new Promise((resolve, reject) => {
                sudo.exec(cmd, options, (err, stdout, stderr) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve({ stdout, stderr });
                });
            });
        });
    }
    executeCommand(args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.exec(args.cmd, args.options);
            }
            catch (err) {
                return err;
            }
        });
    }
    fontInstallation() {
        // const collectionId = (args.collectionId) ? parseInt(args.collectionId) : false;
        // const temporary = (args.temporary && args.temporary === true) ? true : false;
        // const activate = (args.activate && args.activate === true) ? 1 : 0;
        // const connection = this.getConnection();
        // const fonts = (args.files && args.files.length) ? args.files : [];
        // if (collectionId) {
        //   connection.getRepository(Store).find({ collection_id: collectionId }).then(async (result: any[] = []) => {
        //     await fontManager.activationCommand({ files: result, activate, temporary }).then((result) => {
        //       if (result.stderr) {
        //         event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: result.stderr });
        //       } else if (result.stdout) {
        //         if (temporary) {
        //           connection.getCustomRepository(StoreRepository).temporaryCollection(collectionId, activate);
        //         } else {
        //           connection.getCustomRepository(StoreRepository).activateCollection(collectionId, activate);
        //         }
        //         event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { success: true });
        //       } else {
        //         event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: 'Request was not processed.' });
        //       }
        //     }).catch((err) => {
        //       event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: err.message });
        //     });
        //   })
        // } else {
        //   await fontManager.activationCommand(args).then((result) => {
        //     if (result.stderr) {
        //       event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: result.stderr });
        //     } else if (result.stdout) {
        //       let ids = [];
        //       fonts.forEach((item: any) => {
        //         ids.push(item.id)
        //       });
        //       if (temporary) {
        //         connection.getCustomRepository(StoreRepository).temporaryByIds(ids, activate);
        //       } else {
        //         connection.getCustomRepository(StoreRepository).activateByIds(ids, activate);
        //       }
        //       event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { success: true });
        //     } else {
        //       event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: 'Request was not processed.' });
        //     }
        //   }).catch((err) => {
        //     event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: err.message });
        //   });
        // }
    }
    activationCommand(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let executable = this.getSystemManager().getBinaryName();
            let cmdPath = this.getSystemManager().getBinaryPath(executable);
            let temp = (this.systemManager.getPlatform() === 'win' && args.temporary && args.temporary === true) ? true : false;
            let files = [];
            for (let i = 0, total = args.files.length; i < total; i++) {
                let normalized = this.systemManager.normalizePath(args.files[i].file_path);
                files.push(`"${normalized}"`);
            }
            files.join(' ');
            let command = `${cmdPath} -activate=${args.activate} -temp=${temp} ${files}`;
            try {
                return yield this.sudo(command, { name: 'Font Activation' });
            }
            catch (err) {
                return err;
            }
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