import { Component, OnInit, AfterViewInit } from '@angular/core';

import { AuthService, ConfigService, BreadcrumbService } from '@app/core/services';

import { SystemConfig, AuthUser } from '@app/core/interface';

@Component({
  standalone: false,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, AfterViewInit {

  config: SystemConfig;
  user: AuthUser | null;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.config = this.configService.getConfig();
    this.user = this.authService.getAuthUser();
  }

  ngOnInit(): void {
    this.breadcrumbService.set([{
      title: "Dashboard",
      link: "/main"
    }, {
      title: "System Settings",
      link: "/settings"
    }]);
  }

  ngAfterViewInit(): void {

  }

}
