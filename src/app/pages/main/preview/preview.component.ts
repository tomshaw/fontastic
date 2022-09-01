import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
/* eslint-disable-next-line max-len */
import { UtilsService, MessageService, DatabaseService, PresentationService, ConfigService, AlertService, NewsService } from '@app/core/services';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, OnDestroy {

  @ViewChild('scrollElement', { static: true }) scrollElement: ElementRef;

  resultSet: any[] = [];

  isLoading = true;
  isWindows = false;

  fontColor = '#000000';
  fontSize = 3.5;
  wordSpacing = 0;
  letterSpacing = 0;
  displayText: string;
  latestNews: any[] = [];
  displayNews = false;
  backgroundColor = '#000000';

  constructor(
    private utils: UtilsService,
    private alertService: AlertService,
    private configService: ConfigService,
    private messageService: MessageService,
    private databaseService: DatabaseService,
    private presentationService: PresentationService,
    private newsService: NewsService
  ) {
    this.isWindows = this.configService.getIsWindows();
  }

  ngOnInit(): void {

    const scrollElement: Element = this.scrollElement.nativeElement;

    this.databaseService.watchStoreRow$.pipe(delay(1e3 / 5)).subscribe((result) => {
      if (result && result.id) {
        const el = document.getElementById(result.id);
        if (el) {
          this.utils.scrollTo(scrollElement, el.offsetTop);
        }
      }
    });

    this.databaseService.watchResultSet$.subscribe((results) => {
      this.utils.appendStyles(results, () => {
        if (this.latestNews.length) {
          const items = [];
          for (let i = 0, total = results.length; i < total; i++) {
            const item = results[i];
            item.news = this.latestNews[Math.floor(Math.random() * this.latestNews.length)];
            items.push(item);
          }
          this.resultSet = items;
        } else {
          this.resultSet = results;
        }
        scrollElement.scrollTop = 0;
      });
    });

    this.presentationService.watchFontColor$.subscribe((value) => this.fontColor = value);

    this.presentationService.watchFontSize$.subscribe((value) => this.fontSize = value);

    this.presentationService.watchBackgroundColor$.subscribe((value) => this.backgroundColor = value);

    this.presentationService.watchDisplayText$.subscribe((value) => this.displayText = value);

    this.newsService.watchLatestNews$.subscribe((value: any) => {
      if (value.articles && value.articles.length) {
        this.latestNews = value.articles;
        this.presentationService.quickText.push({
          title: 'Latest News',
          text: 'News headlines from sources across the web.'
        });
      }
    });

    this.presentationService._displayNews.subscribe((value) => this.displayNews = value);
    this.presentationService.watchWordSpacing$.subscribe((value) => this.wordSpacing = value);
    this.presentationService.watchLetterSpacing$.subscribe((value) => this.letterSpacing = value);

    setTimeout(() => this.isLoading = false, 1e3);
  }

  ngOnDestroy() { }

  onRowClick(event: Event, item: any): void {
    this.databaseService.setStoreId(item.id);
  }

  getFontSize(): string {
    return this.fontSize + 'px';
  }

  getWordSpacing(): string {
    return this.wordSpacing + 'em';
  }

  getLetterSpacing(): string {
    return this.letterSpacing + 'em';
  }

  getDisplayText(item: any): string {
    if (this.presentationService.getDisplayNews()) {
      return (item.news) ? item.news.title : this.displayText;
    } else {
      return this.displayText;
    }
  }

  onSampleClick(event: Event, item: any): void {
    if (item.sample_text) {
      document.getElementById(`preview_${item.id}`).innerText = item.sample_text;
    }
  }

  onFavoriteClick(event: Event, item: any): void {
    const target = event.target as HTMLInputElement;
    const status = target.classList.contains('favorite') ? true : false;

    if (status) {
      target.classList.remove('favorite');
    } else {
      target.classList.add('favorite');
    }

    const message = (status) ? `Removed favorite ${item.file_name}` : `Created favorite ${item.file_name}`;

    this.messageService.log(message, 1);

    this.messageService.updateStore(item.id, { favorite: !status }).then((result) => {
      this.databaseService.fetchSystemStats();
      this.alertService.success(message);
    });
  }

  openQuickInstall(event: Event, item: any) {
    if (item && item.file_path) {
      this.messageService.openPath(item.file_path);
    }
  }

  openFileLocation(event: Event, item: any) {
    if (item && item.file_path) {
      this.messageService.showItemInFolder(item.file_path);
    }
  }

  openNewsArticle(event: Event, item: any) {
    if (item && item.news.url) {
      this.messageService.openExternal(item.news.url);
    }
  }
}
