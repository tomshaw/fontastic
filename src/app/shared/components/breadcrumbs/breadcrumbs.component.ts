import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/core/services';

@Component({
  standalone: false,
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {

  public breadCrumbs: any[] = [];

  constructor(
    public breadcrumbService: BreadcrumbService
  ) { 
    breadcrumbService.getObservable().subscribe((result) => {
      this.breadCrumbs = result;
    });
  }

  ngOnInit(): void {}

}
