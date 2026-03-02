import { Injectable } from '@angular/core';
import { AuthService, ConfigService, ElectronService, MessageService } from '@app/core/services';
import { SystemConfig } from '@main/types';

@Injectable()
export class BootService {

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private messageService: MessageService,
    private electronService: ElectronService
  ) { }

  public init() {
    return new Promise((resolve, reject) => {
      if (this.electronService.isElectron) {
        this.messageService.systemBoot().then((result: SystemConfig) => {
          this.configService.setConfig(result);
          if (result?.user) {
            this.authService.setAuthUser(result.user);
          }
          if (result?.system?.is_dev) {
            this.configService.debug();
          }
          resolve(result);
        }).catch((err: Error) => reject(err));
      } else {
        resolve(true);
      }
    });
  }
}
