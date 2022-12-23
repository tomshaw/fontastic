import { Injectable } from '@angular/core';
import { ConfigService, ElectronService, MessageService } from '@app/core/services';

@Injectable()
export class BootService {

  constructor(
    private configService: ConfigService,
    private messageService: MessageService,
    private electronService: ElectronService,
  ) { }

  public init() {
    return new Promise((resolve, reject) => {
      if (this.electronService.isElectron) {
        this.messageService.systemBoot().then((result) => {
          console.log('SYSTEM-BOOT-CONFIG', result);
          this.configService.setConfig(result);
          resolve(result);
        });
      }
    });
  }
}
