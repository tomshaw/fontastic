import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService, AuthService, ConfigService, DatabaseService, GravatarService, MessageService, ModalService, PresentationService, UtilsService } from '@app/core/services';
import { AuthUser } from '@main/types';
import { StorageType } from '@main/enums';
import { Collection } from '@main/database/entity';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  collectionId: number;
  currentUser: AuthUser;
  gravatarUrl: string;

  gridEnabled = true;
  toolbarEnabled = true;
  previewEnabled = true;
  inspectEnabled = true;
  navigationEnabled = true;
  asideEnabled = true;

  constructor(
    private router: Router,
    private utils: UtilsService,
    private alertService: AlertService,
    private authService: AuthService,
    private configService: ConfigService,
    private messageService: MessageService,
    private modalService: ModalService,
    private databaseService: DatabaseService,
    private presentationService: PresentationService,
    private gravatar: GravatarService
  ) { }

  ngOnInit() {
    this.databaseService.watchCollectionResultSet$.subscribe((results: Collection[]) => {
      if (results) {
        const collectionId = this.databaseService.getCollectionId();
        if (collectionId) {
          const hasChildren = results.some(x => x.parent_id === collectionId);
          this.collectionId = (hasChildren) ? 0 : collectionId;
        }
      }
    });
    this.authService.watchAuthUser$.subscribe((result: AuthUser) => {
      if (result?.email) {
        this.currentUser = result;
        this.gravatarUrl = this.gravatar.url(result.email, 128, 'mm');
      }
    });
    this.presentationService._asideEnabled.subscribe((result) => {
      this.asideEnabled = result;
    });
    this.presentationService._navigationEnabled.subscribe((result) => {
      this.navigationEnabled = result;
    });
    this.presentationService._gridEnabled.subscribe((result) => {
      this.gridEnabled = result;
    });
    this.presentationService._toolbarEnabled.subscribe((result) => {
      this.toolbarEnabled = result;
    });
    this.presentationService._previewEnabled.subscribe((result) => {
      this.previewEnabled = result;
    });
    this.presentationService._inspectEnabled.subscribe((result) => {
      this.inspectEnabled = result;
    });
    this.presentationService._defaultTheme.subscribe((result) => this.enableTheme(result));
  }

  handleAddFonts(event: Event, collectionId: number): void {
    event.stopPropagation();

    const config = this.configService.get(StorageType.Options);
    const importType = (config?.import?.type) ? config.import.type : 'ask';

    let settings = {
      type: 'question',
      buttons: ['Cancel', 'Select files', 'Select folders'],
      defaultId: 2,
      title: 'Select Fonts',
      message: 'Do you want to select files or folders?'
    };

    if (importType === 'ask') {
      settings = {
        ...settings,
        ...{
          checkboxLabel: 'Add fonts to catalog.',
          checkboxChecked: true
        }
      };
    }

    this.messageService.showMessageBox(settings).then((response: object | any) => {
      if (response?.response > 0) {
        const isFiles = (response.response === 1) ? true : false;
        const options = (isFiles) ? { properties: ['openFile', 'multiSelections'] } : { properties: ['openDirectory', 'multiSelections'] };
        this.messageService.showOpenDialog(options).then((dialog: object | any) => {
          if (dialog.filePaths.length) {
            const addToCatalog = (importType === 'ask') ? response.checkboxChecked : (importType === 'catalog') ? true : false;
            if (isFiles) {
              this.openFiles(collectionId, { files: dialog.filePaths, addToCatalog });
            } else {
              this.openFolders(collectionId, { folders: dialog.filePaths, addToCatalog });
            }
          }
        });
      }
    });
  }

  openFiles(collectionId: number, options: any): void {
    this.presentationService.setLoadingSpinner(true);
    this.alertService.info('Adding fonts please wait..', 1e3, true);
    this.messageService.scanFiles({ ...options, collectionId }).then(this.utils.delay(1e3)).then(() => {
      this.messageService.collectionUpdateCount(collectionId).then((result: Collection[]) => this.databaseService.setCollectionResultSet(result));
      this.presentationService.setLoadingSpinner(false);
      this.alertService.dismiss();
      this.messageService.log(`Added fonts to collection id #${collectionId}.`, 1);

      this.messageService.collectionEnable(collectionId, { enabled: true }).then((results: Collection[]) => {
        this.databaseService.resetPage(1);
        this.databaseService.setCollectionId(collectionId);
        this.databaseService.setCollectionResultSet(results);
      });

    });
  }

  openFolders(collectionId: number, options: any): void {
    this.presentationService.setLoadingSpinner(true);
    this.alertService.info('Adding fonts please wait..', 1e3, true);
    this.messageService.scanFolders({ ...options, collectionId }).then(this.utils.delay(1e3)).then(() => {
      this.messageService.collectionUpdateCount(collectionId).then((result: Collection[]) => this.databaseService.setCollectionResultSet(result));
      this.presentationService.setLoadingSpinner(false);
      this.alertService.dismiss();
      this.messageService.log(`Added folders to collection id #${collectionId}.`, 1);

      this.messageService.collectionEnable(collectionId, { enabled: true }).then((results: Collection[]) => {
        this.databaseService.resetPage(1);
        this.databaseService.setCollectionId(collectionId);
        this.databaseService.setCollectionResultSet(results);
      });

    });
  }

  handleCreateCollection(_event: Event): void {
    this.modalService.open('collection-create');
  }

  handleLogout(_event: Event): void {
    this.authService.logout();
    this.router.navigate(['/settings']);
  }

  handleToggleAside(_event: Event): void {
    this.presentationService.setAsideEnabled(!this.asideEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleNavigation(_event: Event): void {
    this.presentationService.setNavigationEnabled(!this.navigationEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleTogglePreview(_event: Event): void {
    this.presentationService.setPreviewEnabled(!this.previewEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleInspect(_event: Event): void {
    this.presentationService.setInspectEnabled(!this.inspectEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleToolbar(_event: Event): void {
    this.presentationService.setToolbarEnabled(!this.toolbarEnabled);
    this.presentationService.saveLayoutSettings();
  }

  handleToggleGrid(_event: Event): void {
    this.presentationService.setGridEnabled(!this.gridEnabled);
    this.presentationService.saveLayoutSettings();
  }

  enableTheme(theme: string): void {
    const body = document.querySelector('body');
    const themes = this.presentationService.getThemes();
    if (themes.map(item => item.key).includes(theme)) {
      body.setAttribute('data-theme', theme);
    }
  }

  handleSwitchTheme(_event: Event): void {
    const body = document.querySelector('body') as HTMLBodyElement;
    const attr = body.getAttribute('data-theme');
    const themes = this.presentationService.getThemes();

    let idx = themes.map(item => item.key).indexOf(attr);

    if (idx < themes.length - 1) {
      idx++;
    } else {
      idx = 0;
    }

    if (themes[idx]) {
      const theme: string = themes[idx].key;
      body.setAttribute('data-theme', theme);
      this.presentationService.setTheme(theme);
      this.presentationService.setThemeVars(theme);
    }
  }

  handleToggleSearch(_event: Event): void {
    this.presentationService._asideComponent.next('search');
  }

  handleLoadSettings(): void {
    this.modalService.open('system-settings');
  }
}
