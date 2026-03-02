import { Component, OnInit } from '@angular/core';
import { BreadcrumbService, FontService } from '@app/core/services';
import { Breadcrumb } from '@main/types';
import { delay } from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {

  public breadCrumbs: Breadcrumb[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private fontService: FontService
  ) { }

  ngOnInit(): void {
    this.breadcrumbService.getObservable().subscribe((result: Breadcrumb[]) => this.breadCrumbs = result);

    this.fontService.watchFontObject$.pipe(delay(1e3 / 2)).subscribe((result) => {
      if (result?.names?.fontFamily?.en) {
        if (this.breadCrumbs.length) {
          this.breadCrumbs = this.breadCrumbs.filter((item: Breadcrumb) => item.type === 'collection');
          this.breadCrumbs.push({
            title: result.names.fontFamily.en,
            link: '',
            type: 'name'
          });
        }
      }
    });
  }
}
