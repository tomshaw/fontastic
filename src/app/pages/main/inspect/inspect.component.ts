import { Component, OnInit } from '@angular/core';
import { DatabaseService, NewsService, PresentationService } from '@app/core/services';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-inspect',
  templateUrl: './inspect.component.html',
  styleUrls: ['./inspect.component.scss']
})
export class InspectComponent implements OnInit {

  componentName = 'article';

  fontObject: any;
  fontFamily: string;
  fontColor: string;

  latestNews = [];

  constructor(
    private newsService: NewsService,
    private databaseService: DatabaseService,
    private presentationService: PresentationService
  ) { }

  ngOnInit() {

    this.databaseService.watchStoreRow$.pipe(delay(1e3 / 2)).subscribe((result) => {
      if (result && result.font_meta && result.font_meta.tables) {
        this.fontObject = result.font_meta;
        this.fontFamily = result.file_name.replace(/\.[^/.]+$/, '');
      }
    });

    this.presentationService.watchFontColor$.subscribe((value) => this.fontColor = value);

    this.newsService.watchLatestNews$.subscribe((value: any) => this.latestNews = value.articles);
  }

  startsWithNumber(str: string): boolean {
    return /^\d/.test(str);
  }

  onComponentSwitch(): void {
    this.componentName = (this.componentName === 'glyphs') ? 'waterfall' : (this.componentName === 'waterfall') ? 'article' : 'glyphs';
  }

}
