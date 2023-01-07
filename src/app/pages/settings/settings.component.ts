import { Component, OnInit } from '@angular/core';
import { ConfigService, BreadcrumbService } from '@app/core/services';
import { SystemConfig } from '@app/core/interface';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  config: SystemConfig;

  constructor(
    private configService: ConfigService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.config = this.configService.getConfig();
  }

  ngOnInit(): void {
    this.breadcrumbService.set([{
      title: 'Dashboard',
      link: '/main'
    }, {
      title: 'System Settings',
      link: '/settings'
    }]);
  }
}
