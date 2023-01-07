import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SystemConfig } from '@app/core/interface';
import * as constants from '@main/config/constants';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  _systemConfig = new BehaviorSubject<SystemConfig>(null);
  watchSystemConfig$ = this._systemConfig.asObservable();

  set(key: string, values: any): any {
    const config: any = this.getConfig();
    return config[key] = values;
  }

  get(key: string): any {
    if (this.has(key)) {
      return this.getConfig()[key];
    }
    return this.getConfig();
  }

  setConfig(values: any): void {
    this._systemConfig.next(values);
  }

  getConfig(): SystemConfig {
    return this._systemConfig.getValue();
  }

  has(key: string): boolean {
    const config: any = this.getConfig();
    return (config && config[key]) ? true : false;
  }

  debug() {
    console.log('SYSTEM-CONFIG', this.getConfig());
  }

  /**
   * Proxy methods.
   */

  getIsProduction(): boolean {
    return this.get(constants.STORE_SYSTEM).is_production;
  }

  getIsWindows(): boolean {
    return this.get(constants.STORE_SYSTEM).is_windows;
  }
}
