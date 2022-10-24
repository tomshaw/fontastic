import { Component, OnInit } from '@angular/core';
import { DatabaseService, FontService } from '@app/core/services';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit {

  tableNames: any = [];

  constructor(
    private databaseService: DatabaseService,
    private fontService: FontService,
  ) { }

  ngOnInit() {
    this.databaseService.watchStoreRow$.subscribe((result) => {
      if (result && result.font_meta && result.font_meta.names) {
        this.tableNames = this.fontService.normalizeTableNames(result.font_meta.names);
      }
    });
  }

}
