import { Injectable } from '@angular/core';
import { UtilsService } from '@app/core/services/utils/utils.service';
import * as opentype from 'opentype.js';
import { BehaviorSubject } from 'rxjs';
import { fontTableData } from '@main/config/system';

@Injectable({
  providedIn: 'root'
})
export class FontService {

  _fontObject = new BehaviorSubject<opentype.Font>(undefined);
  watchFontObject$ = this._fontObject.asObservable();

  fontTableData = fontTableData;

  constructor(
    private utils: UtilsService
  ) { }

  async load(filePath: string): Promise<opentype.Font> {
    return opentype.load(filePath);
  }

  setFontObject(font: opentype.Font): void {
    this._fontObject.next(font);
  }

  getFontObject(): opentype.Font {
    return this._fontObject.getValue();
  }

  withTransferProtocol(resource: string, protocol: string = 'file') {
    return `${protocol}://${resource}`;
  }

  clearCanvas(context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.beginPath();
  }

  normalizeTable(table: any) {
    if (table) {
      return Object.keys(table).map((property) => {
        const name = this.utils.capitalize(this.utils.normalizeCamelCase(property));
        const prop = table[property];

        let value: any;
        if (Array.isArray(prop) && typeof prop[0] === 'object') {
          value = prop.map((v: any) => JSON.stringify(v));
        } else if (typeof prop === 'object') {
          value = JSON.stringify(prop);
        } else {
          value = prop;
        }

        return {
          name,
          value
        };
      });
    }
  }

  normalizeNameTable(table: any) {
    if (table) {
      return Object.keys(table).map((property) => {
        const lang = Object.keys(table[property])[0];
        const name = this.utils.escapeHtml(this.utils.capitalize(this.utils.normalizeCamelCase(property)));
        const value = this.utils.escapeHtml(table[property][lang]);
        return {
          name,
          lang,
          value
        };
      });
    }
  }
}
