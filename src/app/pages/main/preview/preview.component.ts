import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { delay } from 'rxjs/operators';
import { UtilsService, MessageService, DatabaseService, PresentationService, NewsService, FontService } from '@app/core/services';
import { Store } from '@main/database/entity/Store.schema';
import { NewsArticlesType, NewsType } from '@main/types';

type StoreWithNews<T> = Partial<T> & { news: NewsArticlesType };

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, OnDestroy {

  @ViewChild('scrollElement', { static: true }) scrollElement: ElementRef;

  resultSet = [];

  isLoading = true;

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
    private messageService: MessageService,
    private databaseService: DatabaseService,
    private presentationService: PresentationService,
    private newsService: NewsService,
    private fontService: FontService
  ) { }

  ngOnInit(): void {
    const scrollElement: Element = this.scrollElement.nativeElement;

    this.databaseService.watchStoreResult$.subscribe((result: Store) => {
      if (result) {
        this.utils.createFontStyles([result], (styleString: string) => {
          this.utils.appendStyles(styleString);
        });
      }
    });

    this.databaseService.watchStoreResult$.pipe(delay(1e3 / 5)).subscribe((result: Store) => {
      if (result?.id) {
        const el = document.getElementById(`${result.id}`);
        if (el) {
          this.utils.scrollTo(scrollElement, el.offsetTop);
        }
      }
    });

    this.databaseService.watchStoreResultSet$.subscribe((results: Store[]) => {
      if (this.latestNews.length) {
        const items: StoreWithNews<Store>[] = [];
        for (let i = 0, total = results.length; i < total; i++) {
          const item = results[i];
          const news: NewsArticlesType = this.latestNews[Math.floor(Math.random() * this.latestNews.length)];
          items.push(Object.assign(item, { news }));
        }
        this.resultSet = items;
      } else {
        this.resultSet = results;
      }

      this.renderFontList();
      this.isLoading = false;
      scrollElement.scrollTop = 0;
    });

    this.presentationService.watchFontColor$.subscribe((value: string) => {
      this.fontColor = value;
      this.renderFontList();
    });

    this.presentationService.watchFontSize$.subscribe((value: number) => {
      this.fontSize = value;
      this.renderFontList();
    });

    this.presentationService.watchBackgroundColor$.subscribe((value: string) => this.backgroundColor = value);

    this.presentationService.watchDisplayText$.subscribe((value: string) => {
      this.displayText = value;
      this.renderFontList();
    });

    this.newsService.watchLatestNews$.subscribe((value: NewsType) => {
      if (value?.articles?.length) {
        this.latestNews = value.articles;
        this.presentationService.quickText.push({
          title: 'Latest News',
          text: 'News headlines from sources across the web.'
        });
      }
    });

    this.presentationService._displayNews.subscribe((value: boolean) => this.displayNews = value);
    this.presentationService.watchWordSpacing$.subscribe((value: number) => this.wordSpacing = value);
    this.presentationService.watchLetterSpacing$.subscribe((value: number) => this.letterSpacing = value);
  }

  ngOnDestroy() {
    this.resultSet = [];
  }

  renderFontList() {
    this.resultSet.forEach((item: StoreWithNews<Store>) => {
      const resource = this.fontService.withTransferProtocol(item.file_path, 'file');
      this.fontService.load(resource).then((font: opentype.Font) => {
        const canvas = document.getElementById(`canvas_${item.id}`) as HTMLCanvasElement;

        if (!canvas) {
          return;
        }

        const context = canvas.getContext('2d') as CanvasRenderingContext2D;

        this.fontService.clearCanvas(context);

        const fontSize = this.getFontSize();

        const displayText = this.getDisplayText(item);

        // @TODO Center text based on font size using baseline.
        const path = font.getPath(displayText, 20, 90, fontSize);
        // const metrics = context.measureText(displayTest);
        // const top = font.ascender / font.unitsPerEm * 150;

        path.fill = this.fontColor;

        context.textBaseline = 'middle';
        context.fillStyle = this.backgroundColor;

        path.draw(context);
      }).catch((err) => {
        console.warn('load-font-error', err);
      });
    });
  }

  onRowClick(id: number): void {
    this.databaseService.setStoreId(id);
  }

  getFontSize(): number {
    return this.fontSize;
  }

  getWordSpacing(): string {
    return this.wordSpacing + 'em';
  }

  getLetterSpacing(): string {
    return this.letterSpacing + 'em';
  }

  getDisplayText(item: StoreWithNews<Store>): string {
    if (this.presentationService.getDisplayNews()) {
      return (item.news) ? item.news.title : this.displayText;
    } else {
      return this.displayText;
    }
  }

  onSampleClick(_event: Event, item: Store): void {
    if (item.sample_text) {
      const resource = this.fontService.withTransferProtocol(item.file_path, 'file');
      this.fontService.load(resource).then((font: opentype.Font) => {
        const canvas = document.getElementById(`canvas_${item.id}`) as HTMLCanvasElement;

        if (!canvas) {
          return;
        }

        const context = canvas.getContext('2d') as CanvasRenderingContext2D;

        this.fontService.clearCanvas(context);

        const fontSize = this.getFontSize();

        const path = font.getPath(item.sample_text, 20, 90, fontSize);

        path.fill = this.fontColor;

        context.textBaseline = 'middle';
        context.fillStyle = this.backgroundColor;

        path.draw(context);
      }).catch((err) => {
        console.warn('load-font-error', err);
      });
    }
  }

  onFavoriteClick(event: Event, item: Store): void {
    const target = event.target as HTMLInputElement;
    const status = target.classList.contains('favorite') ? true : false;

    if (status) {
      target.classList.remove('favorite');
      target.innerHTML = 'favorite_bordered';
    } else {
      target.classList.add('favorite');
      target.innerHTML = 'favorite';
    }

    this.messageService.storeUpdate(item.id, { favorite: !status }).then((_result: Store) => {
      // update nav stats
      this.databaseService.fetchSystemStats();
      this.databaseService.fetchCollections();
    });
  }

  openFileViewer(_event: Event, item: Store) {
    if (item?.file_path) {
      this.messageService.openPath(item.file_path);
    }
  }

  openFileLocation(_event: Event, item: Store) {
    if (item?.file_path) {
      this.messageService.showItemInFolder(item.file_path);
    }
  }

  openNewsArticle(_event: Event, item: StoreWithNews<Store>) {
    if (item?.news.url) {
      this.messageService.openExternal(item.news.url);
    }
  }
}
