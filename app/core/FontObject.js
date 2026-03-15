"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fontkit = require("fontkit");
const MAX_CACHE_SIZE = 50;
const fontCache = new Map();
class FontObject {
    constructor(fp) {
        try {
            this.setFont(fontkit.openSync(fp));
        }
        catch (err) {
            this.setError(fp, err.message);
        }
    }
    static fromCache(fp) {
        const cached = fontCache.get(fp);
        if (cached)
            return cached;
        const obj = new FontObject(fp);
        if (!obj.hasError()) {
            if (fontCache.size >= MAX_CACHE_SIZE) {
                const firstKey = fontCache.keys().next().value;
                fontCache.delete(firstKey);
            }
            fontCache.set(fp, obj);
        }
        return obj;
    }
    setFont(font) {
        this.font = font;
    }
    getFont() {
        return this.font;
    }
    setError(file, message) {
        this.error = { file, message };
    }
    getError() {
        return this.error;
    }
    hasError() {
        return !!this.error;
    }
    getNamesTable() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15;
        if (this.namesTable)
            return this.namesTable;
        const names = (_b = (_a = this.font) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.records;
        this.namesTable = {
            compatible_full_name: (_d = (_c = names === null || names === void 0 ? void 0 : names.compatibleFullName) === null || _c === void 0 ? void 0 : _c.en) !== null && _d !== void 0 ? _d : "",
            copyright: (_f = (_e = names === null || names === void 0 ? void 0 : names.copyright) === null || _e === void 0 ? void 0 : _e.en) !== null && _f !== void 0 ? _f : "",
            description: (_h = (_g = names === null || names === void 0 ? void 0 : names.description) === null || _g === void 0 ? void 0 : _g.en) !== null && _h !== void 0 ? _h : "",
            designer: (_k = (_j = names === null || names === void 0 ? void 0 : names.designer) === null || _j === void 0 ? void 0 : _j.en) !== null && _k !== void 0 ? _k : "",
            designer_url: (_m = (_l = names === null || names === void 0 ? void 0 : names.designerURL) === null || _l === void 0 ? void 0 : _l.en) !== null && _m !== void 0 ? _m : "",
            font_family: (_p = (_o = names === null || names === void 0 ? void 0 : names.fontFamily) === null || _o === void 0 ? void 0 : _o.en) !== null && _p !== void 0 ? _p : "",
            font_subfamily: (_r = (_q = names === null || names === void 0 ? void 0 : names.fontSubfamily) === null || _q === void 0 ? void 0 : _q.en) !== null && _r !== void 0 ? _r : "",
            full_name: (_t = (_s = names === null || names === void 0 ? void 0 : names.fullName) === null || _s === void 0 ? void 0 : _s.en) !== null && _t !== void 0 ? _t : "",
            license: (_v = (_u = names === null || names === void 0 ? void 0 : names.license) === null || _u === void 0 ? void 0 : _u.en) !== null && _v !== void 0 ? _v : "",
            license_url: (_x = (_w = names === null || names === void 0 ? void 0 : names.licenseURL) === null || _w === void 0 ? void 0 : _w.en) !== null && _x !== void 0 ? _x : "",
            manufacturer: (_z = (_y = names === null || names === void 0 ? void 0 : names.manufacturer) === null || _y === void 0 ? void 0 : _y.en) !== null && _z !== void 0 ? _z : "",
            manufacturer_url: (_1 = (_0 = names === null || names === void 0 ? void 0 : names.manufacturerURL) === null || _0 === void 0 ? void 0 : _0.en) !== null && _1 !== void 0 ? _1 : "",
            post_script_name: (_3 = (_2 = names === null || names === void 0 ? void 0 : names.postScriptName) === null || _2 === void 0 ? void 0 : _2.en) !== null && _3 !== void 0 ? _3 : "",
            preferred_family: (_5 = (_4 = names === null || names === void 0 ? void 0 : names.preferredFamily) === null || _4 === void 0 ? void 0 : _4.en) !== null && _5 !== void 0 ? _5 : "",
            preferred_sub_family: (_7 = (_6 = names === null || names === void 0 ? void 0 : names.preferredSubfamily) === null || _6 === void 0 ? void 0 : _6.en) !== null && _7 !== void 0 ? _7 : "",
            sample_text: (_9 = (_8 = names === null || names === void 0 ? void 0 : names.sampleText) === null || _8 === void 0 ? void 0 : _8.en) !== null && _9 !== void 0 ? _9 : "",
            trademark: (_11 = (_10 = names === null || names === void 0 ? void 0 : names.trademark) === null || _10 === void 0 ? void 0 : _10.en) !== null && _11 !== void 0 ? _11 : "",
            unique_id: (_13 = (_12 = names === null || names === void 0 ? void 0 : names.uniqueSubfamily) === null || _12 === void 0 ? void 0 : _12.en) !== null && _13 !== void 0 ? _13 : "",
            version: (_15 = (_14 = names === null || names === void 0 ? void 0 : names.version) === null || _14 === void 0 ? void 0 : _14.en) !== null && _15 !== void 0 ? _15 : "",
        };
        return this.namesTable;
    }
}
exports.default = FontObject;
//# sourceMappingURL=FontObject.js.map