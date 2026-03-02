import { Component, OnInit } from '@angular/core';
import { DatabaseService, FontService } from '@app/core/services';

@Component({
  standalone: false,
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss']
})
export class AsideComponent implements OnInit {

  _metaList: any = [];

  constructor(
    private databaseService: DatabaseService,
    private fontService: FontService,
  ) { }

  ngOnInit() {
    this.databaseService.watchStoreRow$.subscribe((result) => {
      if (result && result.font_meta && result.font_meta.names) {
        this._metaList = this.fontService.normalizeTableNames(result.font_meta.names);
      } else {
        console.warn('watchStoreRow$', result);
      }
    });
  }
}
