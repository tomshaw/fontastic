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
const path = require('path');
const exec = require('child_process').exec;
const child = require('child_process').execFile;
class FontCatalog {
    constructor(systemManager) {
        this.setSystemManager(systemManager);
    }
    setSystemManager(systemManager) {
        this.systemManager = systemManager;
    }
    getSystemManager() {
        return this.systemManager;
    }
    getPathExecutable() {
        const name = this.getSystemManager().getBinaryName();
        return this.getSystemManager().getBinaryPath(name);
    }
    createCatalog(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fs.mkdir(folder, { recursive: true });
        });
    }
    commandHelp(done) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield child(this.getPathExecutable(), ['-h'], done);
        });
    }
    findFonts(src, done) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield child(this.getPathExecutable(), ['fonts', 'find', '--root', src], done);
        });
    }
    copyFiles(files, dest, done) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmdPath = this.getPathExecutable();
            const items = files.map((item) => `"${path.normalize(item)}"`).join(" ");
            const command = `${cmdPath} copy files --destination "${dest}" ${items}`;
            return exec(command, done);
        });
    }
    copyFolders(src, dest, done) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = ['copy', 'folders', '--source', src, '--destination', dest];
            return child(this.getPathExecutable(), params, done);
        });
    }
}
exports.default = FontCatalog;
//# sourceMappingURL=FontCatalog.js.map