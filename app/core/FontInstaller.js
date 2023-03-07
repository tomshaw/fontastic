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
const command_1 = require("../helpers/command");
const path = require("path");
class FontInstaller {
    constructor(systemManager, connectionManager) {
        this.systemManager = systemManager;
        this.connectionManager = connectionManager;
    }
    activate(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const fonts = (args.files && args.files.length) ? args.files : [];
            const temporary = (args.temporary && args.temporary === true) ? true : false;
            const activate = (args.activate && args.activate === true) ? 1 : 0;
            if (args.collectionId) {
                let collectionId = parseInt(args.collectionId);
                let results = yield this.connectionManager.getStore().find({ where: { collection_id: collectionId } });
                return yield this.run({ files: results, activate, temporary }).then(() => {
                    if (temporary) {
                        this.connectionManager.getStoreRepository().temporaryCollection(collectionId, activate);
                    }
                    else {
                        this.connectionManager.getStoreRepository().activateCollection(collectionId, activate);
                    }
                });
            }
            else {
                return yield this.run(args).then(() => {
                    let ids = fonts.map((item) => item.id);
                    if (temporary) {
                        this.connectionManager.getStoreRepository().temporaryByIds(ids, activate);
                    }
                    else {
                        this.connectionManager.getStoreRepository().activateByIds(ids, activate);
                    }
                });
            }
        });
    }
    run(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = this.systemManager.getPlatform();
            const executable = this.systemManager.getExecutable();
            const activate = (args.activate) ? 'install' : 'uninstall';
            const temporary = (platform === "win" && args.temporary && args.temporary === true) ? '--temporary=true' : '--temporary=false';
            const files = args.files.map((item) => `"${path.normalize(item.file_path)}"`).join(" ");
            const command = `${executable} ${activate} ${temporary} ${files}`;
            if (platform === 'win') {
                return (0, command_1.prompt)(command, { name: "Font Activation" });
            }
            else {
                return (0, command_1.execute)(command);
            }
        });
    }
}
exports.default = FontInstaller;
//# sourceMappingURL=FontInstaller.js.map