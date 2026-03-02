import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { UtilsService, MessageService, DatabaseService, PresentationService, ConfigService, AlertService, NewsService } from '@app/core/services';
import { delay } from 'rxjs/operators';
import { installable } from '@main/config/mimes';

@Component({
  standalone: false,
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, OnDestroy {

  @ViewChild("scrollElement", { static: true }) scrollElement!: ElementRef;

  resultSet: any[] = [];

  isLoading: boolean = true;
  isWindows: boolean = false;

  fontColor: string = "#000000";
  fontSize: number = 3.5;
  wordSpacing: number = 0;
  letterSpacing: number = 0;
  displayText!: string;
  latestNews: any[] = [];
  displayNews: boolean = false;
  backgroundColor: string = "#000000";

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
        let el = document.getElementById(result.id)!;
        if (el) {
          this.utils.scrollTo(scrollElement, el.offsetTop);
        }
      }
    });

    this.databaseService.watchResultSet$.subscribe((results) => {
      this.utils.appendStyles(results, () => {
        if (this.latestNews.length) {
          let items: any[] = [];
          for (let i = 0, total = results.length; i < total; i++) {
            let item = results[i];
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

    this.newsService.watchLatestNews$.subscribe((results) => this.latestNews = results);

    this.presentationService._displayNews.subscribe((displayNews) => this.displayNews = displayNews);

    this.presentationService.watchWordSpacing$.subscribe((value) => this.wordSpacing = value);

    this.presentationService.watchLetterSpacing$.subscribe((value) => this.letterSpacing = value);

    setTimeout(() => {
      this.isLoading = false;
    }, 1e3)
  }

  ngOnDestroy() { }

  onRowClick(event: any, item: any): void {
    this.databaseService.setStoreId(item.id);
  }

  getFontSize(): string {
    return this.fontSize + "px";
  }

  getWordSpacing(): string {
    return this.wordSpacing + "em";
  }

  getLetterSpacing(): string {
    return this.letterSpacing + "em";
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
      document.getElementById(`preview_${item.id}`)!.innerText = item.sample_text;
    }
  }

  onFavoriteClick(event: Event, item: any): void {
    const target = event.target as HTMLInputElement;
    const status = target.classList.contains('favorite') ? 1 : 0;

    if (status) {
      target.classList.remove('favorite');
    } else {
      target.classList.add('favorite');
    }

    let message = (!status) ? `Deleted favorite ${item.file_name}` : `Created new favorite ${item.file_name}`;
    this.messageService.log(message, 1);

    this.messageService.updateStore(item.id, { favorite: !status }).subscribe((result) => {
      //this.databaseService.setCollection(result);
      this.databaseService.fetchSystemStats();
    });
  }

  handleFontActivation(event: Event, item: any, temporary: boolean = false): void {
    const target = event.target as HTMLInputElement;
    const status = target.classList.contains('active') ? 1 : 0;

    if (!installable.includes(item.file_type)) {
      this.alertService.warning('Only (OpenType) and (TrueType) fonts are supported.', false);
      return;
    }

    let files: any[] = [];
    files.push({
      id: item.id,
      file_path: item.file_path
    });

    let id = this.databaseService.getCollectionId();
    let options = { files, activate: !status, temporary: temporary }

    this.messageService.fontActivation(options).then(() => {

      if (status) {
        target.classList.remove('active');
      } else {
        target.classList.add('active');
      }

      let message = (status) ? `Successfully uninstalled ${item.file_name}` : `Successfully installed ${item.file_name}`;

      this.messageService.log(message, 1);

      this.alertService.success(message, false);

      this.databaseService.setWhere('collection_id', id).run();

    }).catch((err) => {
      this.alertService.error(err, false);
      this.messageService.log(err.message, 1);
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
