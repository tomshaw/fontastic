import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import {
  AuthService,
  ConfigService,
  BreadcrumbService,
  AlertService,
  FontService,
  MessageService,
  DatabaseService,
  PresentationService
} from '@app/core/services';

import { SystemConfig, AuthUser } from '@app/core/interface';

@Component({
  standalone: false,
  selector: 'settings-form-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {

  config: SystemConfig;
  user: AuthUser | null;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private configService: ConfigService,
    private fontService: FontService,
    private messageService: MessageService,
    private breadcrumbService: BreadcrumbService,
    private databaseService: DatabaseService,
    private presentationService: PresentationService,
  ) {
    this.config = this.configService.getConfig();
    this.user = this.authService.getAuthUser();

    this.breadcrumbService.set([{
      title: "Dashboard",
      link: "/main"
    }, {
      title: "System Settings",
      link: "/settings"
    }]);
  }

  ngOnInit(): void { }

  buttonDisabled(isValid: boolean) {
    return (isValid) ? null : true;
  }

  onHandleClick(event: MouseEvent): void {
    this.alertService.info('Applying changes please wait..');
  }

  onResetFavoritedFonts(event: MouseEvent): void {
    this.messageService.resetFavorites().then(() => {
      this.alertService.info('Resetting favorited fonts.', false);
      this.databaseService.fetchSystemStats();
    });
  }

  onResetActivatedFonts(event: MouseEvent): void {}

  onTruncateLogsTable(event: any): void {
    this.messageService.truncateLogs().then(() => {
      this.alertService.info('Truncating system logs..', false);
    });
  }

  onFetchLatestNews(event: any) {
    //this.presentationService.handleLatestNews(true);
    this.alertService.info('Fetching latest news..', false);
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      let data = form.value;
    }
  }
}
