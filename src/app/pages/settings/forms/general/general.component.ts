import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService, BreadcrumbService, AlertService, ConfigService, NewsService, MessageService, DatabaseService, PresentationService } from '@app/core/services';
import { SystemConfig, AuthUser, ImportOptions } from '@app/core/interface';
import { AuthUserModel, ImportOptionsModel } from '@app/core/model';
import { importUserOptions } from '@main/config/system';
import * as constants from '@main/config/constants';

@Component({
  selector: 'app-settings-form-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {

  config: SystemConfig;

  hasNewsArticles = false;

  user: AuthUser = new AuthUserModel('', '', '');

  importOptions = importUserOptions;
  importType: ImportOptions = new ImportOptionsModel('ask');

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private newsService: NewsService,
    private configService: ConfigService,
    private messageService: MessageService,
    private databaseService: DatabaseService,
    private breadcrumbService: BreadcrumbService,
    private presentationService: PresentationService
  ) { }

  ngOnInit(): void {
    if (this.authService.authUserValue) {
      this.user = this.authService.getAuthUser();
    }

    if (this.configService.has(constants.STORE_SETTINGS_IMPORT_TYPE)) {
      const importType = this.configService.get(constants.STORE_SETTINGS_IMPORT_TYPE);
      if (importType) {
        this.importType = new ImportOptionsModel(importType);
      }
    }

    this.newsService.watchLatestNews$.subscribe((value: any) => {
      if (value?.articles.length) {
        this.hasNewsArticles = true;
      }
    });

    this.breadcrumbService.set([{
      title: 'Dashboard',
      link: '/main'
    }, {
      title: 'System Settings',
      link: '/settings'
    }]);
  }

  onImportOptionsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.configService.set(constants.STORE_SETTINGS_IMPORT_TYPE, value);
    this.messageService.set(constants.STORE_SETTINGS_IMPORT_TYPE, value);
  }

  onResetFavoritedFonts(event: Event): void {
    this.messageService.resetFavorites().then(() => {
      this.alertService.info('Successfully reset system favorites.');
      this.databaseService.fetchSystemStats();
    });
  }

  onSystemScan(event: Event) {
    this.alertService.info('Searching system fonts please wait..', 1e3, true);
    this.presentationService.setLoadingSpinner(true);
    this.messageService.syncSystemFonts().then((result: any) => {
      this.messageService.log(`Fetched system fonts found #${result.systemCount.total} total.`, 1);
      this.presentationService.setLoadingSpinner(false);
      this.alertService.clear();
      this.alertService.success(`Found a total of ${result.systemCount.total} system fonts.`, 15e3);
      this.databaseService.setSystemStats(result);
    }).catch((err) => { });
  }

  onSyncActivated(event: Event) {
    this.alertService.info('Searching system fonts please wait..');
    this.presentationService.setLoadingSpinner(true);
    this.messageService.syncActivatedFonts().then((result: any) => {
      const message = `Fetched system fonts found #${result.affected} total.`;
      this.alertService.info(message);
      this.messageService.log(message, 1);
      this.presentationService.setLoadingSpinner(false);
    }).catch((err) => { });
  }

  onRefreshLatestNews(event: Event): void {
    this.newsService.refreshLatestNews(true);
  }

  onExitApplication(event: Event): void {
    this.messageService.beep();
    this.messageService.quitApplication();
  }

  onDropDatabase(event: Event): void {
    const options = {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to drop the database?'
    };

    this.messageService.showMessageBox(options).then((opt: any) => {
      if (opt.response === 0) {
        this.messageService.dropDatabase().then((response: any) => {
          this.messageService.reloadWindow();
        });
      }
    });
  }

  onClearStore(event: Event): void {
    const options = {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to delete the application store?'
    };

    this.messageService.showMessageBox(options).then((opt: any) => {
      if (opt.response === 0) {
        this.messageService.clearStore().then((response: any) => {
          this.messageService.reloadWindow();
        });
      }
    });
  }

  onSubmitButtonClick(event: Event): void {
    this.alertService.info('Applying changes please wait..');
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.messageService.systemAuthenticate(form.value).then((response: AuthUser) => {
        if (response.status === 'ok') {
          this.authService.setAuthUser(response);
        }
        this.alertService.info('Account settings have been updated successfully.');
      });
    }
  }
}
