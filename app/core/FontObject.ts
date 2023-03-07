const opentype = require("opentype.js");

export default class FontObject {

  font: any;
  error: any;

  constructor(fp: string) {
    try {
      this.setFont(opentype.loadSync(fp));
    } catch (err) {
      this.setError(fp, err.message);
    }
  }

  setFont(font: any) {
    this.font = font;
  }

  getFont() {
    return this.font;
  }

  setError(file: string, message: string) {
    this.error = { file, message };
  }

  getError() {
    return this.error;
  }

  hasError() {
    return this.error ? true : false;
  }

  getNamesTable() {
    const names = (this.font && this.font.names) ? this.font.names : false;

    let item: any = {};
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
    item.unique_id = (names && names.uniqueID) ? names.uniqueID.en : "";
    item.version = (names && names.version) ? names.version.en : "";

    return item;
  }
}
