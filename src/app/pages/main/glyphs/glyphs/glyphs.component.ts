import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-glyphs',
  templateUrl: './glyphs.component.html',
  styleUrls: ['./glyphs.component.scss']
})
export class GlyphsComponent implements OnChanges {

  @Input() fontObject: any;
  @Input() fontFamily: string;
  @Input() fontColor: string;

  fontScale: number;
  fontSize: number;
  fontBaseline: number;

  cellCount = 200;
  cellWidth = 40;
  cellHeight = 40;
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

  constructor() { }

  ngOnChanges() {
    if (this.fontObject && this.fontObject.tables) {
      this.initialize();
    }
  }

  initialize() {
    const w = this.cellWidth - this.cellMarginLeftRight * 2;
    const h = this.cellHeight - this.cellMarginTop - this.cellMarginBottom;
    const head = this.fontObject.tables.head;
    const maxHeight = head.yMax - head.yMin;

    this.fontScale = Math.min(w / (head.xMax - head.xMin), h / maxHeight);
    this.fontSize = this.fontScale * this.fontObject.unitsPerEm;
    this.fontBaseline = this.cellMarginTop + h * head.yMax / maxHeight;

    this.paginate().then(() => this.initGlyphList(0));
  }

  async paginate() {
    const numGlyphs: number = this.fontObject.numGlyphs;
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

    if (glyphIndex >= this.fontObject.numGlyphs) {
      return;
    }

    const glyph = this.fontObject.glyphs.get(glyphIndex);
    const glyphWidth = glyph.advanceWidth * this.fontScale;
    const xmin = (this.cellWidth - glyphWidth) / 2;
    const xmax = (this.cellWidth + glyphWidth) / 2;

    const path = glyph.getPath(xmin, this.fontBaseline, this.fontSize);

    path.fill = this.fontColor;
    path.draw(ctx);
  }

  createRange(range: number) {
    const items = [];
    for (let i = 0; i < range + 1; i++) {
      items.push(i);
    }
    return items;
  }

  onCellHover(event: any) {
    const firstGlyphIndex = Number(this.page * this.cellCount);
    const cellIndex = Number(event.target.id.substr(1));
    const glyphIndex = firstGlyphIndex + cellIndex;
    this.glyphName = (glyphIndex <= this.numGlyphs) ? this.fontObject.glyphs.get(glyphIndex).name : '';
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
    setTimeout(() => this.initialize(), 1e3);
  }

  onChangeCount(event: Event) {
    const target = event.target as HTMLInputElement;
    const count = Number(target.value);
    if (count < this.numGlyphs) {
      this.cellCount = count;
      setTimeout(() => this.initialize(), 1e3);
    }
  }
}
