import { Component, OnInit, Input } from '@angular/core';

import { AuthService, ConfigService, BreadcrumbService, MessageService, AlertService } from '@app/core/services';

import { SystemConfig, AuthUser } from '@app/core/interface';

@Component({
  standalone: false,
  selector: 'settings-form-synch',
  templateUrl: './synch.component.html',
  styleUrls: ['./synch.component.scss']
})
export class SynchComponent implements OnInit {

  config: SystemConfig;
  user: AuthUser | null;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private configService: ConfigService,
    private breadcrumbService: BreadcrumbService,
    private messageService: MessageService,
  ) { 
    this.config = this.configService.getConfig();
    this.user = this.authService.getAuthUser();

    this.breadcrumbService.set([{
      title: "Dashboard",
      link: "/main"
    }, {
      title: "System Settings",
      link: "/settings"
    }, {
      title: "Team Synch",
      link: ""
    }]);
  }

  ngOnInit(): void {
  }

}
