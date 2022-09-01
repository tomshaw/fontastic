import { Injectable } from '@angular/core';
import { UtilsService } from '@app/core/services/utils/utils.service';
import opentype from 'opentype.js';

@Injectable({
  providedIn: 'root'
})
export class FontService {

  constructor(
    private utils: UtilsService
  ) { }

  async load(filePath: string) {
    return await opentype.load(filePath);
  }

  normalizeTableNames(names: any, lang: string = 'en') {
    if (names) {
      return Object.keys(names).map((key) => {
        const fixed = this.utils.normalizeCamelCase(key);
        const name = this.utils.capitalize(fixed);
        return {
          key,
          name,
          value: names[key][lang]
        };
      });
    }
  }
}
