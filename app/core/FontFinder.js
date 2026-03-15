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
const SCAN_CONCURRENCY = 10;
class FontFinder {
    constructor(connectionManager) {
        this.errors = [];
        this.counter = 0;
        this.connectionManager = connectionManager;
    }
    getFontMimeType(filePath) {
        const fileType = mime.getType(filePath);
        return fileType && mimes_1.mimeTypes.includes(fileType) ? fileType : null;
    }
    scanFiles(files, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.errors = [];
            this.counter = 0;
            const fontFiles = [];
            for (const fp of files) {
                const fileType = this.getFontMimeType(fp);
                if (fileType) {
                    fontFiles.push({ fp, fileType });
                }
            }
            yield this.processInBatches(fontFiles, options);
        });
    }
    scanFolder(dir, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.errors = [];
            this.counter = 0;
            const fontFiles = yield this.collectFontFiles(dir);
            yield this.processInBatches(fontFiles, options);
        });
    }
    collectFontFiles(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const entries = yield fs.readdir(dir, { withFileTypes: true });
            const subdirPromises = [];
            for (const entry of entries) {
                const fp = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    subdirPromises.push(this.collectFontFiles(fp));
                }
                else {
                    const fileType = this.getFontMimeType(fp);
                    if (fileType) {
                        results.push({ fp, fileType });
                    }
                }
            }
            if (subdirPromises.length > 0) {
                const subdirResults = yield Promise.all(subdirPromises);
                for (const subResults of subdirResults) {
                    results.push(...subResults);
                }
            }
            return results;
        });
    }
    processInBatches(fontFiles, options) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < fontFiles.length; i += SCAN_CONCURRENCY) {
                const batch = fontFiles.slice(i, i + SCAN_CONCURRENCY);
                yield Promise.all(batch.map(({ fp, fileType }) => this.processFont(fp, fileType, options)));
            }
        });
    }
    processFont(fp, fileType, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const font = new FontObject_1.default(fp);
            if (font.hasError()) {
                this.errors.push(font.getError());
                return;
            }
            let stat;
            try {
                stat = yield fs.stat(fp);
            }
            catch (err) {
                this.errors.push({ file: fp, message: err.message });
                return;
            }
            const data = Object.assign(Object.assign({ file_path: fp, file_name: path.basename(fp), file_size: stat.size, file_size_pretty: prettyBytes(stat.size), file_type: fileType, installable: mimes_1.installable.includes(fileType) }, options), font.getNamesTable());
            try {
                yield this.connectionManager.getStoreRepository().create(data);
                this.counter++;
            }
            catch (err) {
                this.errors.push({ file: fp, message: err.message });
            }
        });
    }
}
exports.default = FontFinder;
//# sourceMappingURL=FontFinder.js.map