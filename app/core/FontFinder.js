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
const FontObject_1 = require("./FontObject");
const fs = require("fs/promises");
const path = require("path");
const mimes_1 = require("../config/mimes");
const prettyBytes = require("pretty-bytes");
const mime = require("mime");
class FontFinder {
    constructor(connectionManager) {
        this.errors = [];
        this.counter = 0;
        this.connectionManager = connectionManager;
    }
    isFontFile(filePath) {
        const fileType = mime.getType(filePath);
        return fileType && mimes_1.mimeTypes.includes(fileType);
    }
    scanFiles(files, options) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const fp of files) {
                if (this.isFontFile(fp)) {
                    const stat = yield fs.stat(fp);
                    yield this.processFont(fp, stat, options);
                }
            }
        });
    }
    scanFolder(dir, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const entries = yield fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fp = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    yield this.scanFolder(fp, options);
                }
                else if (this.isFontFile(fp)) {
                    const stat = yield fs.stat(fp);
                    yield this.processFont(fp, stat, options);
                }
            }
        });
    }
    processFont(fp, stat, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const font = new FontObject_1.default(fp);
            if (font.hasError()) {
                this.errors.push(font.getError());
                return;
            }
            const fileType = mime.getType(fp);
            const data = Object.assign(Object.assign({ file_path: fp, file_name: path.basename(fp), file_size: stat.size, file_size_pretty: prettyBytes(stat.size), file_type: fileType, installable: mimes_1.installable.includes(fileType) }, options), font.getNamesTable());
            try {
                yield this.connectionManager.getStoreRepository().create(data);
                this.counter++;
            }
            catch (err) {
                this.errors.push(err.message);
            }
        });
    }
}
exports.default = FontFinder;
//# sourceMappingURL=FontFinder.js.map