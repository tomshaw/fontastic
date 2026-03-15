const fontkit = require('fontkit');

const MAX_CACHE_SIZE = 50;
const fontCache = new Map<string, FontObject>();

export default class FontObject {
  font: any;
  error: any;
  private namesTable: any;

  constructor(fp: string) {
    try {
      this.setFont(fontkit.openSync(fp));
    } catch (err) {
      this.setError(fp, err.message);
    }
  }

  static fromCache(fp: string): FontObject {
    const cached = fontCache.get(fp);
    if (cached) return cached;
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
    return !!this.error;
  }

  getNamesTable() {
    if (this.namesTable) return this.namesTable;

    const names = this.font?.name?.records;

    this.namesTable = {
      compatible_full_name: names?.compatibleFullName?.en ?? '',
      copyright: names?.copyright?.en ?? '',
      description: names?.description?.en ?? '',
      designer: names?.designer?.en ?? '',
      designer_url: names?.designerURL?.en ?? '',
      font_family: names?.fontFamily?.en ?? '',
      font_subfamily: names?.fontSubfamily?.en ?? '',
      full_name: names?.fullName?.en ?? '',
      license: names?.license?.en ?? '',
      license_url: names?.licenseURL?.en ?? '',
      manufacturer: names?.manufacturer?.en ?? '',
      manufacturer_url: names?.manufacturerURL?.en ?? '',
      post_script_name: names?.postScriptName?.en ?? '',
      preferred_family: names?.preferredFamily?.en ?? '',
      preferred_sub_family: names?.preferredSubfamily?.en ?? '',
      sample_text: names?.sampleText?.en ?? '',
      trademark: names?.trademark?.en ?? '',
      unique_id: names?.uniqueSubfamily?.en ?? '',
      version: names?.version?.en ?? '',
    };

    return this.namesTable;
  }
}
