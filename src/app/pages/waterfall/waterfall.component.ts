import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DatabaseService, PresentationService, NewsService } from '@app/core/services';
import { fontTypeScale } from '@main/config/system';

@Component({
  standalone: false,
  selector: 'app-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss']
})
export class WaterfallComponent implements OnInit, OnDestroy {

  fontObject: any;
  fontFamily: string = '';
  latestNews: any[] = [];

  fontColor: string = '';
  displayText: string = '';

  fontSize = 16;

  typeScale: any[] = [];

  fontScaleOptions = fontTypeScale;
  fontScaleSelected = 1.067;

  highScaleLength = 6;
  lowScaleLength = 3;

  private subscriptions: Subscription[] = [];

  constructor(
    private databaseService: DatabaseService,
    private presentationService: PresentationService,
    private newsService: NewsService
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.databaseService.watchStoreRow$.subscribe((result: any) => {
        if (result && result.font_meta) {
          this.fontObject = result.font_meta;
          this.fontFamily = result.font_family;
          this.renderFontScale();
        }
      })
    );

    this.subscriptions.push(
      this.newsService.watchLatestNews$.subscribe((results: any[]) => {
        this.latestNews = results;
      })
    );

    this.subscriptions.push(
      this.presentationService.watchFontColor$.subscribe((value: string) => {
        this.fontColor = value;
        this.renderFontScale();
      })
    );

    this.subscriptions.push(
      this.presentationService.watchDisplayText$.subscribe((value: string) => {
        if (value === 'News headlines from sources across the web.') {
          if (this.latestNews?.length) {
            this.displayText = this.latestNews[Math.floor(Math.random() * this.latestNews.length)].title;
          } else {
            this.displayText = this.presentationService.quickText[0].quote;
          }
        } else {
          this.displayText = value;
        }
        this.renderFontScale();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.latestNews = [];
  }

  getBaseSize(): number {
    return (this.fontSize === 16) ? 1 : this.fontSize / 16;
  }

  renderFontScale(): void {
    if (!this.fontObject?.tables) {
      return;
    }

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
      result = baseSize / scaleRatio;
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
    this.fontSize = Number(target.value);
    this.renderFontScale();
  }

  onFontScaleSelect(event: Event): void {
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
}
