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
const fs = require("fs");
const path = require("path");
const mimes_1 = require("../config/mimes");
const prettyBytes = require("pretty-bytes");
const mime = require("mime");
// https://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
class FileSystem {
    constructor(connectionManager) {
        this.counter = 0;
        this.errors = [];
        this.found = [];
        this.connectionManager = connectionManager;
        this.counter = 0;
        this.errors = [];
    }
    setCounter(count) {
        this.counter = count;
    }
    getCounter() {
        return this.counter;
    }
    scanFolders(dir, options, done) {
        fs.readdir(dir, (err, list) => {
            if (err)
                return done(err);
            let i = 0;
            let next = () => {
                let file = list[i++];
                if (!file)
                    return done(null, this);
                let fp = path.resolve(dir, file);
                fs.stat(fp, (err, stat) => __awaiter(this, void 0, void 0, function* () {
                    if (stat && stat.isDirectory()) {
                        this.scanFolders(fp, options, (err, res) => next());
                    }
                    else {
                        this.fontInstall(fp, stat, options);
                        next();
                    }
                }));
            };
            next();
        });
    }
    scanFiles(files, options, done) {
        files.forEach((fp) => __awaiter(this, void 0, void 0, function* () {
            let stat = fs.statSync(fp);
            if (stat.isFile()) {
                this.fontInstall(fp, stat, options);
            }
        }));
        return done(null, this);
    }
    fontInstall(fp, stat, options) {
        let font = new FontObject_1.default(fp);
        if (font.hasError()) {
            this.errors.push(font.getError());
        }
        else {
            let fileSize = stat.size;
            let fileType = mime.getType(fp);
            let data = Object.assign({ file_path: fp, file_name: path.basename(fp), file_size: fileSize, file_size_pretty: prettyBytes(fileSize), file_type: fileType, installable: mimes_1.installable.includes(fileType) }, options);
            try {
                this.connectionManager.getStoreRepository().create(Object.assign(Object.assign({}, data), font.getNamesTable()));
            }
            catch (err) {
                this.errors.push(err.message);
            }
            this.counter++;
        }
    }
}
exports.default = FileSystem;
//# sourceMappingURL=FontFinder.js.map