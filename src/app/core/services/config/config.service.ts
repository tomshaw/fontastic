import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getProperty, setProperty, hasProperty, deleteProperty } from 'dot-prop';
import { SystemConfig } from '@app/core/interface';
import * as constants from '@main/config/constants';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  _systemConfig = new BehaviorSubject<SystemConfig>(null);
  watchSystemConfig$ = this._systemConfig.asObservable();

  setConfig(values: any): void {
    this._systemConfig.next(values);
  }

  getConfig(): SystemConfig {
    return this._systemConfig.getValue();
  }

  set(key: string, value: any): any {
    const config: any = this.getConfig();
    return setProperty(config, key, value);
  }

  get(key: string): any {
    const config = this.getConfig();
    return getProperty(config, key);
  }

  has(key: string): boolean {
    const config: any = this.getConfig();
    return hasProperty(config, key);
  }

  delete(key: string): boolean {
    const config: any = this.getConfig();
    return deleteProperty(config, key);
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
