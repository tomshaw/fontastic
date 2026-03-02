import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from '../config/config.service';
import { SystemConfig, AuthUser } from '@app/core/interface';

import { apiUrl } from '@main/config'

const storageKey = 'authstore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private systemConfig!: SystemConfig;

  private _authUser = new BehaviorSubject<AuthUser | null>(JSON.parse(localStorage.getItem(storageKey)!));
  watchAuthUser$ = this._authUser.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.configService._systemConfig.subscribe((systemConfig: SystemConfig) => this.systemConfig = systemConfig);
  }

  private getSystemConfig(): SystemConfig | any {
    return this.systemConfig;
  }

  public get authUserValue(): AuthUser | null {
    return this._authUser.value;
  }

  public getAuthUser(): AuthUser | null {
    return this._authUser.getValue();
  }

  getAuthApiUrl(): string {
    let config = this.getSystemConfig();
    if (config.is_production) {
      return apiUrl.production;
    } else {
      return apiUrl.development;
    }
  }

  public login(email: string, password: string) {
    return this.http.post<any>(`${this.getAuthApiUrl()}/login`, { email, password })
      .pipe(map(data => {
        if (data.status === 'ok' && data.token) {
          localStorage.setItem(storageKey, JSON.stringify(data));
          this._authUser.next(data);
          return data;
        } else {
          this.logout();
          window.location.reload;
        }
      }));
  }

  public logout() {
    localStorage.removeItem(storageKey);
    this._authUser.next(null);
  }

  public authCheck() {
    return this.http.post<any>(`${this.getSystemConfig().api.endpoint}/status`, { machine_id: this.getSystemConfig().system.machine_id })
      .pipe(map(data => {
        if (!data.status || data.status !== 'ok') {
          this.logout();
        }
        return data;
      }));
  }

}
