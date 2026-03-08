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
const path = require("path");
class FontCatalog {
    createCatalog(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fs.mkdir(folder, { recursive: true });
        });
    }
    copyFiles(files, dest) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createCatalog(dest);
            yield Promise.all(files.map(file => fs.copyFile(file, path.join(dest, path.basename(file)))));
        });
    }
    copyFolder(src, dest) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.cp(src, dest, { recursive: true });
        });
    }
}
exports.default = FontCatalog;
//# sourceMappingURL=FontCatalog.js.map