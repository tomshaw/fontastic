import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { AppAlert } from '@app/core/interface';

import { alertTypes, alertTimeout } from '../../../../../app/config/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private _alert$ = new Subject<AppAlert>();

  private keep: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keep) {
          this.keep = false;
        } else {
          this.clear();
        }
      }
    });
    this._alert$.subscribe((x: any) => {
      if (x && !x.keep) {
        setTimeout(() => {
          this.clear();
        }, x.timeout)
      }
    });
  }

  getObservable(): Observable<AppAlert> {
    return this._alert$.asObservable();
  }

  send(type: string, message: string, keep: boolean = false, timeout: number = alertTimeout) {
    this.keep = keep;
    let alert = alertTypes.find((item: any) => item.type === type);
    if (alert) {
      this._alert$.next({ type: type, message: message, keep: keep, timeout: timeout, ...alert });
    }
  }

  info(message: string, keep: boolean = false, timeout: number = alertTimeout) {
    this.send('info', message, keep, timeout);
  }

  success(message: string, keep: boolean = false, timeout: number = alertTimeout) {
    this.send('success', message, keep, timeout);
  }

  error(message: string, keep: boolean = false, timeout: number = alertTimeout) {
    this.send('error', message, keep, timeout);
  }

  warning(message: string, keep: boolean = false, timeout: number = alertTimeout) {
    this.send('warning', message, keep, timeout);
  }

  danger(message: string, keep: boolean = false, timeout: number = alertTimeout) {
    this.send('danger', message, keep, timeout);
  }

  clear() {
    //this._alert$.next();
    this.keep = false;
  }

}
