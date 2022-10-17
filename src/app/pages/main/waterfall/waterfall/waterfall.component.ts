import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { PresentationService, NewsService } from '@app/core/services';

@Component({
  selector: 'app-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss']
})
export class WaterfallComponent implements OnChanges, OnInit {

  @Input() fontObject: any;
  @Input() fontFamily: string;
  @Input() fontColor: string;

  displayText: string;
  latestNews: any[] = [];

  baseSize = 16;
  
  waterFall = [];

  fontScale = [
    {
      size: 1.067,
      title: 'Minor Second'
    },
    {
      size: 1.125,
      title: 'Major Second'
    },
    {
      size: 1.200,
      title: 'Minor Third'
    },
    {
      size: 1.250,
      title: 'Major Third'
    },
    {
      size: 1.333,
      title: 'Perfect Fourth'
    },
    {
      size: 1.414,
      title: 'Augmented Fourth'
    },
    {
      size: 1.500,
      title: 'Perfect Fifth'
    },
    {
      size: 1.618,
      title: 'Golden Ratio'
    }
  ];
  selectFontScale = this.fontScale[4].size;

  constructor(
    private presentationService: PresentationService,
    private newsService: NewsService
  ) { }

  ngOnInit(): void {

    this.newsService.watchLatestNews$.subscribe((value: any) => {
      if (value.articles && value.articles.length) {
        this.latestNews = value.articles;
      }
    });

    this.presentationService.watchDisplayText$.subscribe((value) => {
      if (value === 'News headlines from sources across the web.') {
        if (this.latestNews.length) {
          this.displayText = this.latestNews[0].title;
        } else {
          this.displayText = this.presentationService.quickText[0];
        }
      } else {
        this.displayText = value;
      }
    });

    this.setFontScale();
  }

  ngOnChanges(): void {
    if (this.fontObject && this.fontObject.tables) {
      this.setFontScale();
    }
  }

  setFontScale(): void {
    let baseSize = (this.baseSize) ? this.baseSize / 16 : 1;
    const scaleRatio = this.selectFontScale;
    let result = baseSize;

    const waterFall = [];
    for (let i = 0; i < 9; i++) {
      waterFall.push({
        fontSize: Math.round(result * 1000) / 1000 + 'em',
        fontFamily: this.fontFamily,
        fontLabel: Math.round(result * 1000) / 1000 + 'rem/' + ((baseSize * 16) * result).toFixed(2) + 'px'
      });
      result = baseSize * scaleRatio;
      baseSize = result;
    }

    this.waterFall = waterFall;
  }

  onUpdateBaseSize(event: Event): void {
    const target = event.target as HTMLInputElement;
    const baseSize = Number(target.value);
    this.setFontScale();
  }

  onSelectFontScale(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectFontScale = Number(target.value);
    this.setFontScale();
  }
}
