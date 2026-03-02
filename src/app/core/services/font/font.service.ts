import { Injectable } from '@angular/core';
import { UtilsService } from '@app/core/services/utils/utils.service';
import opentype from 'opentype.js'

@Injectable({
  providedIn: 'root'
})
export class FontService {

  private fs: typeof import('fs') | null = null;

  constructor(
    private utils: UtilsService
  ) {
    if (window && window.process && window.process.type) {
      this.fs = (window as any).require('fs');
    }
  }

  async load(filePath: string) {
    if (this.fs) {
      // In Electron renderer, read file via Node fs and parse the buffer
      // opentype.load() uses XHR when window is defined, which doesn't work for local paths
      const buffer = this.fs.readFileSync(filePath);
      return opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
    }
    return await opentype.load(filePath);
  }

  normalizeTableNames(names: any, lang: string = 'en') {
    if (names) {
      return Object.keys(names).map((key) => {
        let fixed = this.utils.normalizeCamelCase(key);
        let name = this.utils.capitalize(fixed);
        return {
          key: key,
          name: name,
          value: names[key][lang]
        };
      });
    }
  }
}
