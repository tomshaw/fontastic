import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AlertService, UtilsService, DatabaseService, PresentationService, MessageService, ConfigService } from '@app/core/services';
import { delay } from 'rxjs/operators';
import { installable } from '@main/config/mimes';

@Component({
  standalone: false,
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  @ViewChild("gridElement", { static: true }) scrollElement!: ElementRef;

  resultSet: any[] = [];

  isLoading: boolean = true;
  isWindows: boolean = false;

  gridExpanded: boolean = true;

  constructor(
    private utils: UtilsService,
    private alertService: AlertService,
    private configService: ConfigService,
    private messageService: MessageService,
    private databaseService: DatabaseService,
    private presentationService: PresentationService
  ) {
    this.isWindows = this.configService.getIsWindows();
  }

  ngOnInit() {

    this.presentationService._gridRowsExpanded.subscribe((result) => this.gridExpanded = result);

    const scrollElement: Element = this.scrollElement.nativeElement;

    this.databaseService.watchStoreRow$.pipe(delay(1e3 / 5)).subscribe((result) => {
      if (result && result.id) {
        let el = document.querySelector(`[data-row="${result.id}"]`) as HTMLDivElement | null;
        if (el) {
          this.utils.scrollTo(scrollElement, el.offsetTop);
        }
      }
    });

    this.databaseService.watchResultSet$.subscribe((results) => {
      this.isLoading = false;

      let items: any = [];
      for (let i: number = 0, total: number = results.length; i < total; i++) {
        let item = results[i];
        let family = item.font_family;
        items[family] = results.filter((item) => {
          return item.font_family === family;
        });
      }

      let out: any[] = [];
      for (let [key, value] of Object.entries(items) as [string, any][]) {
        out.push({
          ...value[0],
          values: value
        })
      }

      this.resultSet = out;

      //scrollElement.scrollTop = 0;
    });
  }

  onRowClick(event: any, item: any): void {
    this.presentationService.saveLayoutSettings();
    this.databaseService.setStoreId(item.id);
  }

  onHandleSort(event: any, column: string): void {
    const target = event.target;

    const asc = target.classList.contains('sorting_asc') ? true : false;
    const desc = target.classList.contains('sorting_desc') ? true : false;
    const sorting = target.classList.contains('sorting') ? true : false;

    let id = this.databaseService.getCollectionId();

    let items = document.querySelectorAll('table thead th');
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

  onButtonExpandFamilies(event: any): void {
    this.presentationService.setGridRowsExpanded(!this.gridExpanded);
    this.handleExpandFamilies(!this.gridExpanded);
  }

  handleExpandFamilies(expanded: boolean) {
    let parents = document.querySelectorAll(`td[data-toggle] span`);
    let children = document.querySelectorAll(`[data-node="child"]`);

    parents.forEach((item) => {
      if (expanded) {
        item.classList.remove('icon-triangle-down');
        item.classList.add('icon-triangle-right');
      } else {
        item.classList.remove('icon-triangle-right');
        item.classList.add('icon-triangle-down');
      }
    });

    children.forEach((item) => {
      if (expanded) {
        item.classList.add('hidden');
      } else {
        item.classList.remove('hidden');
      }
    });
  }

  onButtonExpandFamily(event: any, item: any): void {
    const target = event.target;
    const contains = target.classList.contains('icon-triangle-right');

    let children = document.querySelectorAll(`[data-parent="${item.id}"]`);

    children.forEach((item) => {
      if (contains) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });

    if (contains) {
      target.classList.remove('icon-triangle-right');
      target.classList.add('icon-triangle-down');
    } else {
      target.classList.remove('icon-triangle-down');
      target.classList.add('icon-triangle-right');
    }
  }

  handleCollectionActivation(event: any, temporary: boolean = false): void {
    const target = event.currentTarget;
    const element = target.firstChild;
    const checked = element.checked ? true : false;

    element.checked = (checked) ? false : true;

    let id = this.databaseService.getCollectionId();
    let total = this.databaseService.getResultSetTotal();
    let options = { collectionId: id, activate: !checked, temporary: temporary };

    this.messageService.fontActivation(options).then((result: any) => {

      let message = (checked) ? `Successfully deactivated collection.` : `Successfully activated collection.`;

      this.messageService.log(message, 1);

      this.alertService.success(message, false);

      this.databaseService.setWhere('collection_id', id).run();

    }).catch((err) => {
      this.alertService.error(err, false);
    });
  }

  handleFamilyActivation(event: any, item: any, temporary: boolean = false): void {
    const target = event.currentTarget;
    const element = target.firstChild;
    const checked = element.checked ? true : false;
    const children = document.querySelectorAll(`[data-parent="${item.id}"]`);

    element.checked = (checked) ? false : true;

    let files: any[] = [];
    children.forEach((item: any) => {
      let filePath = item.getAttribute('data-file');
      let installable = item.getAttribute('data-installable');
      let data = {
        id: item.id,
        file_path: filePath
      };
      if (installable) {
        files.push(data);
      }
    });

    if (!files.length) {
      this.alertService.warning('No installable files found.', false);
      return;
    }

    let options = { files: files, activate: !checked, temporary: temporary };

    this.messageService.fontActivation(options).then((result: any) => {

      let message = (checked) ? `Successfully deactivated font family.` : `Successfully activated font family.`;

      this.messageService.log(message, 1);

      this.alertService.success(message, false);

      children.forEach((item: any) => {
        let cell = item.querySelector(temporary ? `td:nth-of-type(2)` : `td:nth-of-type(1)`);
        let input = cell.querySelector('input');
        input.checked = (checked) ? false : true;
      });

    }).catch((err) => {
      this.alertService.error(err, false);
    });
  }

  handleFontActivation(event: any, item: any, temporary: boolean = false): void {
    const target = event.currentTarget;
    const element = target.firstChild;
    const checked = element.checked ? true : false;

    element.checked = (checked) ? false : true;

    if (!installable.includes(item.file_type)) {
      this.alertService.warning('Only (OpenType) and (TrueType) fonts are supported.', false);
      return;
    }

    let files: any[] = [];
    files.push({
      id: item.id,
      file_path: item.file_path
    });

    let options = { files, activate: !checked, temporary: temporary };

    this.messageService.fontActivation(options).then((result: any) => {

      let message = (checked) ? `Successfully deactivated ${item.file_name}.` : `Successfully activated ${item.file_name}.`;

      this.messageService.log(message, 1);

      this.alertService.success(message);

    }).catch((err) => {
      this.alertService.error(err, false);
    });
  }
}
