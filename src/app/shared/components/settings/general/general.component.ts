import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService, AlertService, ConfigService, NewsService, MessageService, DatabaseService, PresentationService } from '@app/core/services';
import { AuthUserModel, ImportOptionsModel } from '@app/core/model';
import { SystemConfig, AuthUser, ImportOptions, NewsType } from '@main/types';
import { importUserOptions } from '@main/config/system';
import { StorageType } from '@main/enums';

@Component({
  selector: 'app-settings-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {

  config: SystemConfig;

  hasNewsApiKey = false;

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
    private presentationService: PresentationService
  ) { }

  ngOnInit(): void {
    if (this.authService.authUserValue) {
      this.user = this.authService.getAuthUser();
    }

    if (this.configService.has(StorageType.Import)) {
      const importType = this.configService.get(StorageType.Import);
      if (importType) {
        this.importType = new ImportOptionsModel(importType);
      }
    }

    this.newsService.watchLatestNews$.subscribe((result: NewsType) => {
      if (result?.apiKey) {
        this.hasNewsApiKey = true;
      }
    });
  }

  onImportOptionsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.configService.set(StorageType.Import, value);
    this.messageService.set(StorageType.Import, value);
  }

  onResetFavoritedFonts(_event: Event): void {
    this.messageService.resetFavorites().then(() => {
      this.alertService.info('Successfully reset system favorites.');
      this.databaseService.fetchSystemStats();
    });
  }

  onSystemScan(_event: Event): void {
    this.alertService.info('Searching system fonts..');
    this.presentationService.setLoadingSpinner(true);
    this.messageService.syncSystemFonts().then((result: any) => {
      const message = `Found #${result.systemCount} system fonts.`;
      this.alertService.info(message);
      this.messageService.log(message, 1);
      this.presentationService.setLoadingSpinner(false);
      this.databaseService.setSystemStats(result);
    }).catch((_err) => { });
  }

  onSyncActivated(_event: Event): void {
    this.alertService.info('Searching activated fonts..');
    this.presentationService.setLoadingSpinner(true);
    this.messageService.syncActivatedFonts().then((result: any) => {
      const message = `Found #${result.activatedCount} activated fonts.`;
      this.alertService.info(message);
      this.messageService.log(message, 1);
      this.presentationService.setLoadingSpinner(false);
    }).catch((_err) => { });
  }

  onRefreshLatestNews(_event: Event): void {
    this.newsService.fetchLatestNews(true);
  }

  onRestartApplication(_event: Event): void {
    this.messageService.beep();
    this.messageService.reloadWindow();
  }

  onExitApplication(_event: Event): void {
    this.messageService.beep();
    this.messageService.quitApplication();
  }

  onDropDatabase(_event: Event): void {
    const options = {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to drop the database?'
    };

    this.messageService.showMessageBox(options).then((response: any) => {
      if (response.response === 0) {
        this.messageService.dropDatabase().then(() => this.messageService.reloadWindow());
      }
    });
  }

  onClearStore(_event: Event): void {
    const options = {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to delete the application store?'
    };

    this.messageService.showMessageBox(options).then((response: any) => {
      if (response.response === 0) {
        this.messageService.clearStore().then(() => this.messageService.reloadWindow());
      }
    });
  }

  onSubmitButtonClick(_event: Event): void {
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
