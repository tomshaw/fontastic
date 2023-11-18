import { Component, OnInit } from '@angular/core';
import { FontService, MessageService, PresentationService, UtilsService } from '@app/core/services';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit {

  fontTitle = 'Font Information';

  tableData = [];
  openTabs = [];
  omitable = [];

  constructor(
    private fontService: FontService,
    private messageService: MessageService,
    private presentationService: PresentationService,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {
    this.presentationService._asideTableTabs.subscribe((result: any[]) => this.openTabs = result);

    this.fontService.watchFontObject$.subscribe((font: opentype.Font) => {
      this.fontTitle = font?.names?.fontFamily?.en;

      if (font?.tables) {
        const tables = font.tables;

        const data = [];
        for (const name in tables) {
          if (Object.prototype.hasOwnProperty.call(tables, name)) {
            const table = tables[name];

            if (this.omitable.includes(name)) {
              continue;
            }

            const search = (tableName: string) => this.fontService.fontTableData.find(element => element.name.toLowerCase() === tableName);
            const found = search(name.toLowerCase());
            const title = (found) ? found.title : name;
            const url = (found) ? found.url : '';

            const value = (name === 'name') ? this.fontService.normalizeNameTable(table) : this.fontService.normalizeTable(table);
            const order = (name === 'name') ? 1 : 2;

            data.push({ name, title, order, value, url });
          }
        }

        this.tableData = data.sort(this.utilsService.compare.bind(this.utilsService));
      }
    });
  }

  handleToggleCollapse(name: string): void {
    if (this.openTabs.includes(name)) {
      this.openTabs.splice(this.openTabs.indexOf(name), 1);
    } else {
      this.openTabs.push(name);
    }
    this.presentationService.setAsideTableTabs(this.openTabs);
  }

  handleCollapseAll() {
    this.openTabs = [];
  }

  openTableNameReference(url: string) {
    if (url) {
      this.messageService.openPath(url);
    }
  }

  onComponentSwitch() {
    this.presentationService.setAsideComponent('store');
  }
}
