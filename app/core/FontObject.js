"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fontkit = require("fontkit");
class FontObject {
    constructor(fp) {
        try {
            this.setFont(fontkit.openSync(fp));
        }
        catch (err) {
            this.setError(fp, err.message);
        }
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
        return this.error ? true : false;
    }
    getNamesTable() {
        const names = (this.font && this.font.name && this.font.name.records) ? this.font.name.records : false;
        let item = {};
        item.compatible_full_name = (names && names.compatibleFullName) ? names.compatibleFullName.en : "";
        item.copyright = (names && names.copyright) ? names.copyright.en : "";
        item.description = (names && names.description) ? names.description.en : "";
        item.designer = (names && names.designer) ? names.designer.en : "";
        item.designer_url = (names && names.designerURL) ? names.designerURL.en : "";
        item.font_family = (names && names.fontFamily) ? names.fontFamily.en : "";
        item.font_subfamily = (names && names.fontSubfamily) ? names.fontSubfamily.en : "";
        item.full_name = (names && names.fullName) ? names.fullName.en : "";
        item.license = (names && names.license) ? names.license.en : "";
        item.license_url = (names && names.licenseURL) ? names.licenseURL.en : "";
        item.manufacturer = (names && names.manufacturer) ? names.manufacturer.en : "";
        item.manufacturer_url = (names && names.manufacturerURL) ? names.manufacturerURL.en : "";
        item.post_script_name = (names && names.postScriptName) ? names.postScriptName.en : "";
        item.preferred_family = (names && names.preferredFamily) ? names.preferredFamily.en : "";
        item.preferred_sub_family = (names && names.preferredSubfamily) ? names.preferredSubfamily.en : "";
        item.sample_text = (names && names.sampleText) ? names.sampleText.en : "";
        item.trademark = (names && names.trademark) ? names.trademark.en : "";
        item.unique_id = (names && names.uniqueSubfamily) ? names.uniqueSubfamily.en : "";
        item.version = (names && names.version) ? names.version.en : "";
        return item;
    }
}
exports.default = FontObject;
//# sourceMappingURL=FontObject.js.map