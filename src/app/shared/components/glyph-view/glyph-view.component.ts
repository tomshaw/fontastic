import { Component, OnInit } from '@angular/core';
import { FontService, ModalService, PresentationService } from '@app/core/services';
import { Glyph, Metrics, Path, RenderOptions } from 'opentype.js';

@Component({
  selector: 'app-glyph',
  templateUrl: './glyph-view.component.html',
  styleUrls: ['./glyph-view.component.scss']
})
export class GlyphViewComponent implements OnInit {

  fontObject: opentype.Font;

  glyphIndex: number;

  fillColor: string;
  strokeColor: string;

  fontScale: number;
  fontSize: number;
  fontBaseline: number;

  glyph: Glyph;
  metrics: Metrics;
  path: Path;

  glyphMargin = 5;
  glyphScale: number;
  glyphSize: number;
  glyphBaseline: number;
  glyphMarkSize = 10;

  arrowLength = 10;
  arrowAperture = 4;

  height = 400;
  width = 400;

  pixelRatio = window.devicePixelRatio || 1;

  constructor(
    private fontService: FontService,
    public modalService: ModalService,
    private presentationService: PresentationService
  ) {
    const root = document.documentElement as HTMLElement;
    this.fillColor = root.style.getPropertyValue('--fill-color');
    this.strokeColor = root.style.getPropertyValue('--stroke-color');
  }

  ngOnInit() {
    this.presentationService.watchGlyphIndex$.subscribe((result: number) => {
      setTimeout(() => {
        this.initialize(result);
      }, 1e3/3);
    });
    this.fontService.watchFontObject$.subscribe((result: opentype.Font) => this.fontObject = result);
  }

  onComponentSwitch() {
    this.presentationService.setInspectComponent('glyph-list');
  }

  getElement(id: string): HTMLCanvasElement {
    return document.getElementById(id) as HTMLCanvasElement;
  }

  getContext(element: HTMLCanvasElement): CanvasRenderingContext2D {
    return element.getContext('2d') as CanvasRenderingContext2D;
  }

  getGlyphById(glyphIndex: number): Glyph {
    return this.fontObject.glyphs.get(glyphIndex);
  }

  getPath(x?: number, y?: number, fontSize?: number, options?: RenderOptions, font?: opentype.Font): Path {
    return this.glyph.getPath(x, y, fontSize, options, font);
  }

  getMetrics(): Metrics {
    return this.glyph.getMetrics();
  }

  initialize(glyphIndex: number) {
    this.glyphIndex = glyphIndex;

    if (!this.glyphIndex || !this.fontObject) {
      return;
    }

    const element = this.getElement('glyph-bg');
    if (!element) {
      return;
    }

    const ctx = this.getContext(element);
    ctx.clearRect(0, 0, this.width, this.height);

    this.glyph = this.getGlyphById(this.glyphIndex);
    this.metrics = this.glyph.getMetrics();

    const glyphW = this.width - this.glyphMargin * 2;
    const glyphH = this.height - this.glyphMargin * 2;

    const head = this.fontObject.tables.head;
    const maxHeight = head.yMax - head.yMin;

    this.glyphScale = Math.min(glyphW / (head.xMax - head.xMin), glyphH / maxHeight);
    this.glyphSize = this.glyphScale * this.fontObject.unitsPerEm;
    this.glyphBaseline = this.glyphMargin + glyphH * head.yMax / maxHeight;

    ctx.fillStyle = this.strokeColor;

    this.drawLine(ctx, 'Baseline', 0);
    this.drawLine(ctx, 'yMax', this.fontObject.tables.head.yMax);
    this.drawLine(ctx, 'yMin', this.fontObject.tables.head.yMin);
    this.drawLine(ctx, 'Ascender', this.fontObject.tables.hhea.ascender + 100);
    this.drawLine(ctx, 'Descender', this.fontObject.tables.hhea.descender + 100);
    this.drawLine(ctx, 'Typo Ascender', this.fontObject.tables.os2.sTypoAscender + 150);
    this.drawLine(ctx, 'Typo Descender', this.fontObject.tables.os2.sTypoDescender + 150);

    this.displayGlyph();
  }

  drawLine(ctx: CanvasRenderingContext2D, text: string, yunits: number): void {
    const ypx = this.glyphBaseline - yunits * this.glyphScale;
    ctx.fillText(text, 2, ypx + 3);
    ctx.fillRect(80, ypx, this.width, 1);
  }

  displayGlyph(): void {
    const ctx = this.getContext(this.getElement('glyph-fg'));
    ctx.clearRect(0, 0, this.width, this.height);

    const glyphWidth = this.glyph.advanceWidth * this.glyphScale;

    const xmin = (this.width - glyphWidth) / 2;
    const xmax = (this.width + glyphWidth) / 2;

    ctx.fillRect(xmin - this.glyphMarkSize + 1, this.glyphBaseline, this.glyphMarkSize, 1);
    ctx.fillRect(xmin, this.glyphBaseline, 1, this.glyphMarkSize);
    ctx.fillRect(xmax, this.glyphBaseline, this.glyphMarkSize, 1);
    ctx.fillRect(xmax, this.glyphBaseline, 1, this.glyphMarkSize);

    ctx.fillText('0', xmin, this.glyphBaseline + this.glyphMarkSize + 10);
    ctx.fillText(`${this.glyph.advanceWidth}`, xmax, this.glyphBaseline + this.glyphMarkSize + 10);

    ctx.fillStyle = this.strokeColor;
    ctx.textAlign = 'center';

    const path = this.getPath(xmin, this.glyphBaseline, this.glyphSize);

    path.fill = this.fillColor; // Glyph fill color
    path.stroke = this.strokeColor; // Glyph stroke color
    path.strokeWidth = 1.5;

    this.drawPathWithArrows(ctx, path);

    this.glyph.drawPoints(ctx, xmin, this.glyphBaseline, this.glyphSize);
  }

  drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);
    const unitx = dx / segmentLength;
    const unity = dy / segmentLength;
    const basex = x2 - this.arrowLength * unitx;
    const basey = y2 - this.arrowLength * unity;
    const normalx = this.arrowAperture * unity;
    const normaly = -this.arrowAperture * unitx;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(basex + normalx, basey + normaly);
    ctx.lineTo(basex - normalx, basey - normaly);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
  }

  drawPathWithArrows(ctx: CanvasRenderingContext2D, path: any): void {
    let x1: any;
    let y1: any;
    let x2: any;
    let y2: any;

    ctx.beginPath();

    const arrows = [];
    for (const cmd of path.commands) {
      if (cmd.type === 'M') {
        if (x1 !== undefined) {
          arrows.push([ctx, x1, y1, x2, y2]);
        }
        ctx.moveTo(cmd.x, cmd.y);
      } else if (cmd.type === 'L') {
        ctx.lineTo(cmd.x, cmd.y);
        x1 = x2;
        y1 = y2;
      } else if (cmd.type === 'C') {
        ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
        x1 = cmd.x2;
        y1 = cmd.y2;
      } else if (cmd.type === 'Q') {
        ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
        x1 = cmd.x1;
        y1 = cmd.y1;
      } else if (cmd.type === 'Z') {
        arrows.push([ctx, x1, y1, x2, y2]);
        ctx.closePath();
      }
      x2 = cmd.x;
      y2 = cmd.y;
    }
    if (path.fill) {
      ctx.fillStyle = path.fill;
      ctx.fill();
    }
    if (path.stroke) {
      ctx.strokeStyle = path.stroke;
      ctx.lineWidth = path.strokeWidth;
      ctx.stroke();
    }
    ctx.fillStyle = this.strokeColor;

    arrows.forEach((arrow) => this.drawArrow(arrow[0], arrow[1], arrow[2], arrow[3], arrow[4]));
  }
}
