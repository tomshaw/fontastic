import { Component, OnInit } from '@angular/core';
import { AuthService, ConfigService, BreadcrumbService, MessageService } from '@app/core/services';
import { Logger } from '@main/database/entity/Logger.schema';
import { SystemConfig, AuthUser } from '@main/types';

@Component({
  selector: 'app-settings-form-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

  config: SystemConfig;
  user: AuthUser;

  resultSet: any[] = [];

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private breadcrumbService: BreadcrumbService,
    private messageService: MessageService,
  ) {
    this.config = this.configService.getConfig();
    this.user = this.authService.getAuthUser();

    this.breadcrumbService.set([{
      title: 'Dashboard',
      link: '/main'
    }, {
      title: 'System Settings',
      link: '/settings'
    }, {
      title: 'System Logs',
      link: ''
    }]);
  }

  ngOnInit(): void {
    this.messageService.fetchLogs().then((result: Logger[]) => this.resultSet = result);
  }

  filterMessageType(type: number): string {
    return (type === 1) ? 'System Action' : 'User Action';
  }

  filterMessageStatus(type: number): string {
    return (type === 1) ? 'Error' : 'Success';
  }

  handleDelete(id: number): void {
    this.messageService.deleteLog({ id }).then((result: Logger[]) => this.resultSet = result);
  }

  handleTruncate(event: Event): void {
    this.messageService.truncateLogs();
  }
}
