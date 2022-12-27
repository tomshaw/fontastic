import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SystemConfig } from '@app/core/interface';
import { AuthUser } from '@app/core/interface';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  _systemConfig: BehaviorSubject<SystemConfig> = new BehaviorSubject<SystemConfig>({});

  set(key: string, values: any): any {
    const config: any = this.getConfig();
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
    const config: any = this.getConfig();
    return config[key] ? true : false;
  }

  /**
   * Miscellaneous settings.
   */

  getAppPath(): string {
    return this.get('system')?.app_path;
  }

  getUserDataPath(): string {
    return this.get('system')?.user_data_path;
  }

  getCatalogPath(): string {
    return this.get('system')?.catalog_path;
  }

  getIsProduction(): boolean {
    return this.get('system')?.is_production;
  }

  getIsWindows(): boolean {
    return this.get('system')?.is_windows;
  }

  getAuthUser(): AuthUser {
    return this.get('ACCOUNT');
  }
}
