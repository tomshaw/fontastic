import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { AlertService, ConfigService, UtilsService, DatabaseService, MessageService } from '@app/core/services';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('gridElement', { static: true }) scrollElement: ElementRef;

  resultSet = [];

  isLoading = true;
  isWindows = false;

  constructor(
    private utils: UtilsService,
    private alertService: AlertService,
    private configService: ConfigService,
    private messageService: MessageService,
    private databaseService: DatabaseService,
  ) {
    this.isWindows = this.configService.getIsWindows();
  }

  ngOnInit() {
    const scrollElement: Element = this.scrollElement.nativeElement;

    this.databaseService.watchStoreRow$.pipe(delay(1e3 / 5)).subscribe((result) => {
      if (result?.id) {
        const el: HTMLDivElement = document.querySelector(`[data-row="${result.id}"]`);
        if (el) {
          this.utils.scrollTo(scrollElement, el.offsetTop);
        }
      }
    });

    this.databaseService.watchResultSet$.subscribe((results) => {
      this.resultSet = results;
      this.isLoading = false;
      scrollElement.scrollTop = 0;
    });
  }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.resultSet = [];
  }

  onRowClick(id: number): void {
    this.databaseService.setStoreId(id);
  }

  onHandleSort(event: Event, column: string): void {
    const target = event.target as HTMLInputElement;

    const asc = target.classList.contains('sorting_asc') ? true : false;
    const desc = target.classList.contains('sorting_desc') ? true : false;
    const sorting = target.classList.contains('sorting') ? true : false;

    const id = this.databaseService.getCollectionId();

    const items = document.querySelectorAll('table thead th');
    items.forEach((item) => {
      if (item.classList.contains('sorting_asc')) {
        item.classList.remove('sorting_asc');
        item.classList.add('sorting');
      }
      if (item.classList.contains('sorting_desc')) {
        item.classList.remove('sorting_desc');
        item.classList.add('sorting');
      }
    });

    if (sorting) {
      target.classList.remove('sorting');
      target.classList.add('sorting_desc');
      this.databaseService.setOrder(column, 'DESC').setWhere('collection_id', id).run();
    } else {
      if (asc) {
        target.classList.remove('sorting_asc');
        target.classList.add('sorting_desc');
        this.databaseService.setOrder(column, 'DESC').setWhere('collection_id', id).run();
      } else if (desc) {
        target.classList.remove('sorting_desc');
        target.classList.add('sorting_asc');
        this.databaseService.setOrder(column, 'ASC').setWhere('collection_id', id).run();
      }
    }
  }

  onHandleActivate(event: any, item: any, temporary: boolean = false): void {
    const target = event.target.firstChild as HTMLInputElement;
    const checked = target.checked ? true : false;

    target.checked = (checked) ? false : true;

    if (!item.installable) {
      this.alertService.warning('Only (OpenType) and (TrueType) fonts are supported.');
      return;
    }

    const files = [];

    files.push({
      id: item.id,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      file_path: item.file_path
    });

    const options = { files, activate: !checked, temporary };

    this.messageService.fontActivation(options).then((result: any) => {

      const message = (checked) ? `Successfully deactivated ${item.file_name}.` : `Successfully activated ${item.file_name}.`;

      this.messageService.log(message, 1);

      this.alertService.success(message);

    }).catch((err) => this.alertService.error(err));
  }
}
