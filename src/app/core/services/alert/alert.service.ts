import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppAlert } from '@main/types';
import { AlertTypes, AlertTimeout, AlertProps } from '@main/config/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  _alert = new BehaviorSubject<AppAlert>(null);
  watchAlert$ = this._alert.asObservable();

  constructor(
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.clear();
      }
    });
  }

  getObservable(): Observable<AppAlert> {
    return this._alert.asObservable();
  }

  getAlert(): AppAlert {
    return this._alert.getValue();
  }

  setAlert(values: AppAlert): void {
    this._alert.next(values);
  }

  send(type: string, message: string, timeout: number = AlertTimeout, keep: boolean = false): void {
    const alert = AlertTypes.find((item: any) => item.type === type);
    if (alert) {
      this.setAlert({ type, message, timeout, keep, ...alert });
    }
  }

  info(message: string, timeout: number = AlertTimeout, keep: boolean = false): void {
    this.send('info', message, timeout, keep);
  }

  success(message: string, timeout: number = AlertTimeout, keep: boolean = false): void {
    this.send('success', message, timeout, keep);
  }

  error(message: string, timeout: number = AlertTimeout, keep: boolean = false): void {
    this.send('error', message, timeout, keep);
  }

  warning(message: string, timeout: number = AlertTimeout, keep: boolean = false): void {
    this.send('warning', message, timeout, keep);
  }

  danger(message: string, timeout: number = AlertTimeout, keep: boolean = false): void {
    this.send('danger', message, timeout, keep);
  }

  clear(): void {
    this._alert.next(AlertProps);
  }

  dismiss() {
    setTimeout(() => this.clear(), this.getAlert().timeout);
  }
}
