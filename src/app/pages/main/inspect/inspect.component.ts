import { Component, OnInit } from '@angular/core';
import { DatabaseService, PresentationService } from '@app/core/services';

@Component({
  selector: 'app-inspect',
  templateUrl: './inspect.component.html',
  styleUrls: ['./inspect.component.scss']
})
export class InspectComponent implements OnInit {

  font: any;

  fontColor = '#000000';
  fontScale: number;
  fontSize: number;
  fontBaseline: number;

  cellCount = 100;
  cellWidth = 60;
  cellHeight = 60;
  cellMarginTop = 1;
  cellMarginBottom = 1;
  cellMarginLeftRight = 1;

  glyphName = '';

  page = 0;
  numPages = 0;
  numGlyphs = 0;
  paginatorOptions: any[] = [];

  cellSizeOptions: any[] = [30, 40, 50, 60, 80, 100, 120, 140, 160, 180, 200, 250, 300, 400, 500, 600, 700, 800];
  cellCountOptions: any[] = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

  pixelRatio = window.devicePixelRatio || 1;

  constructor(
    private databaseService: DatabaseService,
    private presentationService: PresentationService
  ) { }

  ngOnInit() {

    this.databaseService.watchStoreRow$.subscribe((result) => {
      if (result && result.font_meta) {
        this.font = result.font_meta;
        this.processFont();
      }
    });

    this.presentationService.watchFontColor$.subscribe((value) => {
      this.fontColor = value;
      if (this.font) {
        this.processFont();
      }
    });
  }

  processFont() {

    if (!this.font && !this.font.tables) {
      return;
    }

    this.page = 0;

    const w = this.cellWidth - this.cellMarginLeftRight * 2;
    const h = this.cellHeight - this.cellMarginTop - this.cellMarginBottom;
    const head = this.font.tables.head;
    const maxHeight = head.yMax - head.yMin;

    this.fontScale = Math.min(w / (head.xMax - head.xMin), h / maxHeight);
    this.fontSize = this.fontScale * this.font.unitsPerEm;
    this.fontBaseline = this.cellMarginTop + h * head.yMax / maxHeight;

    this.initPaginator().then(() => this.initGlyphList(0));
  }

  async initPaginator() {
    const numGlyphs: number = this.font.numGlyphs;
    const numPages: number = Math.ceil(numGlyphs / this.cellCount);

    const data = [];
    for (let i = 0; i < numPages; i++) {
      const lastIndex = Math.min(numGlyphs - 1, (i + 1) * this.cellCount - 1);
      const text = i * this.cellCount + '-' + lastIndex;
      data.push({
        key: i,
        value: text
      });
    }

    this.paginatorOptions = data;
    this.numGlyphs = numGlyphs - 1;
    this.numPages = numPages;

    return data;
  }

  initGlyphList(page: number = 0) {
    const firstGlyph = page * this.cellCount;
    for (let i = 0; i < this.cellCount; i++) {
      const el = document.getElementById('g' + i) as HTMLCanvasElement;
      if (el) {
        this.renderGlyphItem(el, firstGlyph + i);
      }
    }
  }

  renderGlyphItem(canvas: HTMLCanvasElement, glyphIndex: any) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, this.cellWidth, this.cellHeight);

    if (glyphIndex >= this.font.numGlyphs) {
      return;
    }

    const glyph = this.font.glyphs.get(glyphIndex);
    const glyphWidth = glyph.advanceWidth * this.fontScale;
    const xmin = (this.cellWidth - glyphWidth) / 2;
    const xmax = (this.cellWidth + glyphWidth) / 2;
    const x0 = xmin;

    const path = glyph.getPath(x0, this.fontBaseline, this.fontSize);
    path.fill = this.fontColor;
    path.draw(ctx);
  }

  createRange(range: number) {
    const items = [];
    for (let i = 1; i <= range; i++) {
      items.push(i);
    }
    return items;
  }

  onCellHover(event: any) {
    if (!this.font) {
      return;
    }
    const firstGlyphIndex = Number(this.page * this.cellCount);
    const cellIndex = Number(event.target.id.substr(1));
    const glyphIndex = firstGlyphIndex + cellIndex;
    if (glyphIndex <= this.font.numGlyphs) {
      const glyph = this.font.glyphs.get(glyphIndex);
      this.glyphName = glyph.name;
    } else {
      this.glyphName = '';
    }
  }

  onChangePage(event: Event) {
    const target = event.target as HTMLInputElement;
    this.page = Number(target.value);
    this.initGlyphList(this.page);
  }

  onChangeSize(event: Event) {
    const target = event.target as HTMLInputElement;
    const size = Number(target.value);
    this.cellHeight = size;
    this.cellWidth = size;
    setTimeout(() => this.processFont(), 1e3/2);
  }

  onChangeCount(event: Event) {
    const target = event.target as HTMLInputElement;
    const count = Number(target.value);
    if (count < this.numGlyphs) {
      this.cellCount = count;
      setTimeout(() => this.processFont(), 1e3/2);
    }
  }
}
