import { Component, OnInit } from '@angular/core';
import { DatabaseService, PresentationService, FontService } from '@app/core/services';

@Component({
  standalone: false,
  selector: 'app-inspect',
  templateUrl: './inspect.component.html',
  styleUrls: ['./inspect.component.scss']
})
export class InspectComponent implements OnInit {

  font: any;

  fontColor: string = "#000000";
  fontScale!: number;
  fontSize!: number;
  fontBaseline!: number;

  cellCount: number = 100;
  cellWidth: number = 30;
  cellHeight: number = 30;
  cellMarginTop: number = 1;
  cellMarginBottom: number = 8;
  cellMarginLeftRight: number = 1;

  glyphName: string = '';

  page: number = 0;
  numPages: number = 0;
  numGlyphs: number = 0;
  paginatorOptions: any[] = [];

  cellSizeOptions: any[] = [30, 40, 50, 60, 80, 100, 120, 140, 160, 180, 200, 250, 300, 400, 500, 600, 700, 800];
  cellCountOptions: any[] = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

  pixelRatio = window.devicePixelRatio || 1;

  constructor(
    private fontService: FontService,
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
      if (this.font) this.processFont();
    });
  }

  processFont() {

    if (!this.font && !this.font.tables) {
      return;
    }

    this.page = 0;

    let w = this.cellWidth - this.cellMarginLeftRight * 2;
    let h = this.cellHeight - this.cellMarginTop - this.cellMarginBottom;
    let head = this.font.tables.head;
    let maxHeight = head.yMax - head.yMin;

    this.fontScale = Math.min(w / (head.xMax - head.xMin), h / maxHeight);
    this.fontSize = this.fontScale * this.font.unitsPerEm;
    this.fontBaseline = this.cellMarginTop + h * head.yMax / maxHeight;

    this.initPaginator().then(() => this.initGlyphList(0));
  }

  async initPaginator() {
    let numGlyphs: number = this.font.numGlyphs;
    let numPages: number = Math.ceil(numGlyphs / this.cellCount);

    let data = [];
    for (let i = 0; i < numPages; i++) {
      let lastIndex = Math.min(numGlyphs - 1, (i + 1) * this.cellCount - 1);
      let text = i * this.cellCount + '-' + lastIndex;
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
    let firstGlyph = page * this.cellCount;
    for (let i = 0; i < this.cellCount; i++) {
      let el = <HTMLCanvasElement>document.getElementById('g' + i);
      if (el) {
        this.renderGlyphItem(el, firstGlyph + i);
      }
    }
  }

  renderGlyphItem(canvas: HTMLCanvasElement, glyphIndex: any) {
    let cellMarkSize = 4;
    let ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.cellWidth, this.cellHeight);

    if (glyphIndex >= this.font.numGlyphs) return;

    // ctx.fillStyle = this.fontColor; // Number
    // ctx.font = '5pt sans-serif';
    // ctx.fillText(glyphIndex + 1, 1, this.cellHeight - 1);

    let glyph = this.font.glyphs.get(glyphIndex);
    let glyphWidth = glyph.advanceWidth * this.fontScale;
    let xmin = (this.cellWidth - glyphWidth) / 2;
    let xmax = (this.cellWidth + glyphWidth) / 2;
    let x0 = xmin;

    // ctx.fillStyle = this.fontColor; // Arrows '#00a0be'
    // //ctx.globalAlpha = 0.4;
    // ctx.fillRect(xmin - cellMarkSize + 1, this.fontBaseline, cellMarkSize, 0.4);
    // ctx.fillRect(xmin, this.fontBaseline, 1, cellMarkSize);
    // ctx.fillRect(xmax, this.fontBaseline, cellMarkSize, 0.4);
    // ctx.fillRect(xmax, this.fontBaseline, 1, cellMarkSize);

    let path = glyph.getPath(x0, this.fontBaseline, this.fontSize);
    path.fill = this.fontColor;
    path.draw(ctx);
  }

  createRange(number: number) {
    let items: number[] = [];
    for (let i = 1; i <= number; i++) {
      items.push(i);
    }
    return items;
  }

  onCellHover(event: any) {
    if (!this.font) return;
    let firstGlyphIndex = this.page * this.cellCount;
    let cellIndex = parseInt(event.target.id.substr(1));
    let glyphIndex = firstGlyphIndex + cellIndex;
    if (glyphIndex <= this.font.numGlyphs) {
      let glyph = this.font.glyphs.get(glyphIndex);
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
    setTimeout(() => {
      this.processFont();
    }, 1e3/2)
  }

  onChangeCount(event: Event) {
    const target = event.target as HTMLInputElement;
    const count = Number(target.value);
    if (count < this.numGlyphs) {
      this.cellCount = count;
      setTimeout(() => {
        this.processFont();
      }, 1e3/2)
    }
  }
}
