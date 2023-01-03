import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatabaseService, NewsService, PresentationService } from '@app/core/services';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-inspect',
  templateUrl: './inspect.component.html',
  styleUrls: ['./inspect.component.scss']
})
export class InspectComponent implements OnInit, OnDestroy {

  componentName = 'glyphs';

  fontObject: any;
  fontFamily: string;
  fontColor: string;

  latestNews: any[] = [];

  constructor(
    private databaseService: DatabaseService,
    private presentationService: PresentationService,
    private newsService: NewsService
  ) { }

  ngOnInit() {
    this.databaseService.watchStoreRow$.pipe(delay(1e3 / 2)).subscribe((result) => {
      if (result && result.font_meta && result.font_meta.tables) {
        this.fontObject = result.font_meta;
        this.fontFamily = result.file_name.replace(/\.[^/.]+$/, '');
      }
    });

    this.newsService.watchLatestNews$.subscribe((value: any) => {
      if (value.articles && value.articles.length) {
        this.latestNews = value.articles;
      }
    });

    this.presentationService.watchFontColor$.subscribe((value) => this.fontColor = value);

    this.presentationService._inspectComponent.subscribe((value: string) => this.componentName = value);
  }

  ngOnDestroy() {
    this.fontObject = null;
  }

  startsWithNumber(str: string): boolean {
    return /^\d/.test(str);
  }

  onComponentSwitch(): void {
    this.componentName = (this.componentName === 'glyphs') ? 'waterfall' : 'glyphs';
  }

}
