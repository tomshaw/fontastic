import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatabaseService, FontService, NewsService, PresentationService } from '@app/core/services';
import { NewsArticlesType, NewsType } from '@main/types';
import { Store } from '@main/database/entity/Store.schema';

@Component({
  selector: 'app-inspect',
  templateUrl: './inspect.component.html',
  styleUrls: ['./inspect.component.scss']
})
export class InspectComponent implements OnInit, OnDestroy {

  componentName = 'glyph-list';
  componentList = ['glyph-list', 'typescale'];

  fontObject: opentype.Font;
  fontFamily: string;
  fontColor: string;
  latestNews: NewsArticlesType[] = [];

  constructor(
    private fontService: FontService,
    private databaseService: DatabaseService,
    private newsService: NewsService,
    private presentationService: PresentationService
  ) { }

  ngOnInit() {
    this.databaseService.watchStoreResult$.subscribe((result: Store) => {
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

    this.presentationService.watchFontColor$.subscribe((value) => this.fontColor = value);

    this.presentationService._inspectComponent.subscribe((value: string) => {
      this.componentName = this.componentList.includes(value) ? value : this.componentName;
    });
  }

  ngOnDestroy() {
    this.fontObject = null;
  }

  startsWithNumber(str: string): boolean {
    return /^\d/.test(str);
  }

  onComponentSwitch(): void {
    this.componentName = (this.componentName === 'glyph-list') ? 'typescale' : 'glyph-list';
    this.presentationService.setInspectComponent(this.componentName);
  }
}
