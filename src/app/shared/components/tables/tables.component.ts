import { Component, OnInit } from '@angular/core';
import { FontService, PresentationService } from '@app/core/services';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit {

  tableNames: any = [];

  constructor(
    private fontService: FontService,
    private presentationService: PresentationService
  ) { }

  ngOnInit() {
    this.fontService.watchFontObject$.subscribe((result: opentype.Font) => {
      if (result?.names) {
        this.tableNames = this.fontService.normalizeTableNames(result.names);
      }
    });
  }

  onComponentSwitch() {
    this.presentationService.setAsideComponent('search');
    this.presentationService.saveLayoutSettings();
  }

}
