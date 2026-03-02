import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { PresentationService } from '@app/core/services';
import { fontTypeScale } from '@main/config/system';

@Component({
  selector: 'app-typescale',
  templateUrl: './typescale.component.html',
  styleUrls: ['./typescale.component.scss']
})
export class TypescaleComponent implements OnChanges, OnInit, OnDestroy {
  
  @Input() fontObject: opentype.Font;
  @Input() fontFamily: string;
  @Input() latestNews: any[] = [];

  fontColor: string;
  displayText: string;

  fontSize = 16;

  typeScale = [];

  fontScaleOptions = fontTypeScale;
  fontScaleSelected = 1.067;

  highScaleLength = 6;
  lowScaleLength = 3;

  constructor(
    private presentationService: PresentationService
  ) { }

  ngOnInit() {
    this.presentationService.watchFontColor$.subscribe((value: string) => {
      this.fontColor = value;
      this.ngOnChanges();
    });

    this.presentationService.watchDisplayText$.subscribe((value: string) => {
      if (value === 'News headlines from sources across the web.') {
        if (this.latestNews?.length) {
          this.displayText = this.latestNews[Math.floor(Math.random() * this.latestNews.length)].title;
        } else {
          this.displayText = this.presentationService.quickText[0];
        }
      } else {
        this.displayText = value;
      }
      this.ngOnChanges();
    });
    this.ngOnChanges();
  }

  ngOnDestroy() {
    this.latestNews = [];
  }

  ngOnChanges() {
    if (this.fontObject?.tables) {
      this.renderFontScale();
    }
  }

  getBaseSize(): number {
    return (this.fontSize === 16) ? 1 : this.fontSize / 16;
  }

  renderFontScale(): void {
    const high = this.renderHighScale();
    const low = this.renderLowScale();

    this.typeScale = [...high.reverse(), ...low];
  }

  renderHighScale(): any[] {
    let baseSize = 1;
    const scaleRatio = this.fontScaleSelected;
    let result = 1;

    const items = [];
    for (let i = 0; i < this.highScaleLength; i++) {
      const em = Math.round(result * 1000) / 1000;
      const px = ((this.getBaseSize() * 16) * result).toFixed(2);
      const label = em + 'rem/' + px + 'px';
      const size = px + 'px';
      const active = (i === 0) ? true : false;

      items.push({ 
        em,
        px,
        label,
        size,
        active 
      });

      result = baseSize * scaleRatio;
      baseSize = result;
    }

    return items;
  }

  renderLowScale(): any[] {
    let baseSize = 1;
    const scaleRatio = this.fontScaleSelected;
    let result = 1;

    const items = [];
    for (let i = 0; i < this.lowScaleLength; i++) {
      result = baseSize/scaleRatio;
      baseSize = result;
      
      const em = Math.round(result * 1000) / 1000;
      const px = ((this.getBaseSize() * 16) * result).toFixed(2);
      const label = em + 'rem/' + px + 'px';
      const size = px + 'px';
      const active = false;

      items.push({ 
        em,
        px,
        label,
        size,
        active 
      });
    }

    return items;
  }

  onUpdateFontSize(event: Event): void {
    const target = event.target as HTMLInputElement;
    const baseSize = Number(target.value);
    this.renderFontScale();
  }

  onfontScaleSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.fontScaleSelected = Number(target.value);
    this.renderFontScale();
  }

  onRandomNewsArticle(): void {
    if (this.latestNews?.length) {
      this.displayText = this.latestNews[Math.floor(Math.random() * this.latestNews.length)].title;
      this.renderFontScale();
    }
  }

  onHandleScaleSize(isHighScale: boolean): void {
    if (isHighScale) {
      this.highScaleLength++;
    } else {
      this.lowScaleLength++;
    }
    this.renderFontScale();
  }

  onHandleScaleReset(): void {
    this.highScaleLength = 6;
    this.lowScaleLength = 3;
    this.renderFontScale();
  }

  onComponentSwitch(): void {
    this.presentationService.setInspectComponent('glyph-list');
  }
}
