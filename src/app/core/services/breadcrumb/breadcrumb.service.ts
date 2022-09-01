import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';

export interface IBreadcrumb {
  title: string;
  link: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  private _breadcrumb$ = new Subject<IBreadcrumb[]>();

  constructor(
    private router: Router
  ) { 
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {}
    });
  }

  getObservable(): Observable<IBreadcrumb[]> {
    return this._breadcrumb$.asObservable();
  }

  set(data: IBreadcrumb[] = []) {
    if (data.length) {
      this._breadcrumb$.next(data);
    }
  }

  setNavigation(id: number, data: any[], items: any = []) {
    const found = data.filter((item: any) => item.id === id);
    if (found.length) {
      items.push({
        title: found[0].title, 
        link: ''
      });
      return this.setNavigation(found[0].parent_id, data, items);
    }
    return this.set(items.reverse());
  }
}
