import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { delay } from 'rxjs/operators';
import { AlertService, ConfigService, UtilsService, DatabaseService, MessageService } from '@app/core/services';
import { Store } from '@main/database/entity/Store.schema';
import { QueryOptions } from '@main/types';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, OnDestroy {

  @ViewChild('gridElement', { static: true }) scrollElement: ElementRef;

  resultSet: Store[] = [];
  queryOptions: QueryOptions;

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

    this.databaseService.watchStoreResult$.pipe(delay(1e3 / 5)).subscribe((result: Store) => {
      if (result?.id) {
        const el: HTMLDivElement = document.querySelector(`[data-row="${result.id}"]`);
        if (el) {
          this.utils.scrollTo(scrollElement, el.offsetTop);
        }
      }
    });

    this.databaseService.watchStoreResultSet$.subscribe((result: Store[]) => {
      this.resultSet = result;
      this.isLoading = false;
      scrollElement.scrollTop = 0;
    });

    // this.databaseService.setOrder('id', 'ASC');

    this.databaseService.watchQueryOptions$.subscribe((result: QueryOptions) => this.queryOptions = result);
  }

  ngOnDestroy() {
    this.resultSet = [];
  }

  onRowClick(id: number): void {
    this.databaseService.setStoreId(id);
  }

  handleSort(column: string): void {
    const collectionId = this.databaseService.getCollectionId();
    const queryOptions: QueryOptions = this.databaseService.getQueryOptions();

    this.databaseService.setOrder(column, (queryOptions.order.direction === 'DESC') ? 'ASC' : 'DESC').setWhere('collection_id', collectionId).run();
  }

  handleActivate(event: Event, item: Store, temporary: boolean = false): void {
    const target = event.target as HTMLElement;
    const input = target.firstChild as HTMLInputElement;
    const checked = input.checked ? true : false;

    input.checked = (checked) ? false : true;

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

    this.messageService.fontActivation(options).then(() => {
      const message = (checked) ? `Successfully deactivated ${item.file_name}.` : `Successfully activated ${item.file_name}.`;
      this.messageService.log(message, 1);
      this.alertService.success(message);
    }).catch((err) => this.alertService.error(err));
  }
}
