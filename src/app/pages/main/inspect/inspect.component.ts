import { Component, OnDestroy, OnInit } from '@angular/core';
import { delay } from 'rxjs/operators';
import { DatabaseService, FontService, NewsService, PresentationService } from '@app/core/services';
import { NewsArticlesType, NewsType } from '@main/types';
import { Store } from '@main/database/entity/Store.schema';

@Component({
  selector: 'app-inspect',
  templateUrl: './inspect.component.html',
  styleUrls: ['./inspect.component.scss']
})
export class InspectComponent implements OnInit, OnDestroy {

  componentName = 'glyphs';

  fontObject: opentype.Font;
  fontFamily: string;
  fontColor: string;

  latestNews: NewsArticlesType[] = [];

  constructor(
    private fontService: FontService,
    private newsService: NewsService,
    private databaseService: DatabaseService,
    private presentationService: PresentationService
  ) { }

  ngOnInit() {
    this.databaseService.watchStoreRow$.pipe(delay(1e3 / 2)).subscribe((result: Store) => {
      if (result) {
        this.fontFamily = result.file_name.replace(/\.[^/.]+$/, '');
      }
    });

    this.fontService.watchFontObject$.subscribe((result: opentype.Font) => {
      if (result) {
        this.fontObject = result;
      }
    });

    this.newsService.watchLatestNews$.subscribe((result: NewsType) => {
      if (result?.articles?.length) {
        this.latestNews = result.articles;
      }
    });

    this.presentationService.watchFontColor$.subscribe((value: string) => this.fontColor = value);
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
