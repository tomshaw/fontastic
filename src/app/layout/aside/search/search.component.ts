import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DatabaseService } from '@app/core/services';
import { SearchFormModel } from '@app/core/model';
import { fontMimeTypes } from '@main/config/mimes';
import { dbColumns } from '@main/config/database';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @ViewChild(NgForm) form: NgForm;

  model: SearchFormModel = new SearchFormModel('', [], 'id', 'ASC', true);

  fontTypes = fontMimeTypes;
  dbColumns = dbColumns;
  orderBy = ['ASC', 'DESC']

  constructor(
    private databaseService: DatabaseService,
  ) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    const value = this.form.value;

    this.databaseService.resetWhere();

    this.databaseService.setSearch(true);

    if (value.term) {
      this.databaseService.setWhere('term', value.term);
    }

    if (value.mimes && value.mimes.length) {
      this.databaseService.setWhere('file_type', value.mimes);
    }

    if (value.sort && value.order) {
      this.databaseService.setOrder(value.sort, value.order);
    }

    this.databaseService.run();
  }

  onReset(): void {
    this.databaseService.setSearch(false);
    this.databaseService.resetWhere().run();
  }

}
