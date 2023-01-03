import { Component, OnInit } from '@angular/core';
import { BreadcrumbService, DatabaseService } from '@app/core/services';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {

  private breadCrumbs: any[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private databaseService: DatabaseService
  ) { }

  ngOnInit(): void {
    this.breadcrumbService.getObservable().subscribe((result) => this.breadCrumbs = result);

    this.databaseService.watchStoreRow$.subscribe((result) => {
      if (this.breadCrumbs.length > 2) {
        this.breadCrumbs.pop();
      }
      if (result?.full_name) {
        this.breadCrumbs.push({
          title: result.full_name,
          link: ''
        });
      }
    });
  }
}
