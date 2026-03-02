import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BreadcrumbService, DatabaseService, PresentationService } from '@app/core/services';
import { SearchFormModel } from '@app/core/model';
import { fontMimeTypes } from '@main/config/mimes';
import { dbColumns } from '@main/config/database';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {

  @ViewChild(NgForm) form: NgForm;

  model: SearchFormModel = new SearchFormModel('', [], 'id', 'ASC', true);

  fontTypes = fontMimeTypes;
  dbColumns = dbColumns;
  orderBy = ['ASC', 'DESC'];

  constructor(
    private databaseService: DatabaseService,
    private breadcrumbService: BreadcrumbService,
    private presentationService: PresentationService
  ) { }

  onSubmit(): void {
    const value = this.form.value;

    this.databaseService.resetWhere();

    this.databaseService.setSearch(true);
    this.databaseService.stats = false;

    if (value?.term) {
      this.databaseService.setWhere('term', value.term);
      this.addBreadcrumb(value.term);
    }

    if (value?.mimes?.length) {
      this.databaseService.setWhere('file_type', value.mimes);
    }

    if (value?.sort && value?.order) {
      this.databaseService.setOrder(value.sort, value.order);
    }

    this.databaseService.run();
  }

  addBreadcrumb(searchTerm: string): void {
    this.breadcrumbService.set([{
      title: 'System Search',
      link: '/main',
      type: 'collection'
    }, {
      title: searchTerm,
      link: '',
      type: 'collection'
    }]);
  }

  onReset(): void {
    this.databaseService.setSearch(false);
    this.databaseService.resetWhere().run();
    this.breadcrumbService.setNavigation(this.databaseService.getCollectionId(), this.databaseService.getCollectionResultSet());
  }

  onComponentSwitch() {
    this.presentationService.setAsideComponent('tables');
  }
}
