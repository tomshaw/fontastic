import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Breadcrumb } from '@main/types';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  private _breadcrumb$ = new Subject<Breadcrumb[]>();

  getObservable(): Observable<Breadcrumb[]> {
    return this._breadcrumb$.asObservable();
  }

  set(results: Breadcrumb[] = []) {
    this._breadcrumb$.next(results);
  }

  setNavigation(collectionId: number, results: any[], items: Breadcrumb[] = []) {
    const found = results.filter((item: any) => item.id === collectionId);

    if (found.length) {
      items.push({ title: found[0].title, link: '', type: 'collection' });
      return this.setNavigation(found[0].parent_id, results, items);
    }

    return this.set(items.reverse());
  }
}
