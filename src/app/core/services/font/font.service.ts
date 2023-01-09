import { Injectable } from '@angular/core';
import { UtilsService } from '@app/core/services/utils/utils.service';
import * as opentype from 'opentype.js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FontService {

  _fontObject = new BehaviorSubject<opentype.Font>(undefined);
  watchFontObject$ = this._fontObject.asObservable();

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
