import { Component, OnInit, Input } from '@angular/core';

import { AuthService, ConfigService, BreadcrumbService, MessageService, AlertService } from '@app/core/services';

import { SystemConfig, AuthUser } from '@app/core/interface';

@Component({
  standalone: false,
  selector: 'settings-form-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

  config: SystemConfig;
  user: AuthUser | null;

  resultSet: any[] = [];

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
      title: "System Logs",
      link: ""
    }]);
  }

  ngOnInit(): void {
    this.messageService.fetchLogs({}).then((results) => {
      this.resultSet = results;
    });
  }

  filterMessageType(type: number): string {
    if (type == 1) {
      return 'System Action';
    } else {
      return 'User Action'
    }
  }

  filterMessageStatus(type: number): string {
    if (type == 1) {
      return 'Error';
    } else {
      return 'Success';
    }
  }

  handleDelete(id: number): void {
    this.messageService.deleteLog({id: id}).then((results) => {
      this.resultSet = results;
    });
  }

  handleTruncate($event: any): void {
    this.messageService.truncateLogs().then((results) => {
      this.resultSet = results;
    });
  }

}
