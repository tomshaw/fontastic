import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SystemConfig } from '@app/core/interface'

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  _systemConfig: BehaviorSubject<SystemConfig> = new BehaviorSubject<SystemConfig>({});

  set(key: string, values: any): any {
    let config: any = this.getConfig();
    return config[key] = values;
  }

  get(key: string): any {
    if (this.has(key)) {
      return this.getConfig()[key];
    }
    return false;
  }

  setConfig(values: any): void {
    this._systemConfig.next(values);
  }

  getConfig(): SystemConfig {
    return this._systemConfig.getValue();
  }

  has(key: string): boolean {
    let config: any = this.getConfig();
    return config[key] ? true : false;
  }

  /**
   * Begin miscellaneous objects.
   */

  getIsWindows(): boolean {
    return this.get('system')?.is_windows;
  }
}
