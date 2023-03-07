import { Component, OnInit } from '@angular/core';
import { ConfigService } from '@app/core/services';

export interface AppVersion {
  system: string;
  electron: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  version: AppVersion;
  ngVersion: string;
  
  constructor(
    private configService: ConfigService,
  ) { }

  ngOnInit() {
    if (this.configService.has('system.version')) {
      this.version = this.configService.get('system.version') as AppVersion;
    }
    if (this.configService.has('ng-version')) {
      this.ngVersion = this.configService.get('ng-version');
    }
  }

}
