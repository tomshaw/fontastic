import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getProperty, setProperty, hasProperty, deleteProperty } from 'dot-prop';
import { SystemConfig } from '@main/types';
import { StorageType } from '@main/enums';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  _systemConfig = new BehaviorSubject<SystemConfig>(null);
  watchSystemConfig$ = this._systemConfig.asObservable();

  setConfig(values: SystemConfig): void {
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
    const config: SystemConfig = this.getConfig();
    console.log(config);
  }

  /**
   * Proxy methods.
   */

  getIsProduction(): boolean {
    return this.get(StorageType.System)?.is_production;
  }

  getIsWindows(): boolean {
    return this.get(StorageType.System)?.is_windows;
  }

  getSystemVersion(): boolean {
    return this.get(StorageType.System)?.version;
  }
}
