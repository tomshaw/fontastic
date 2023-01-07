import { Component, OnInit } from '@angular/core';
import { UtilsService, MessageService, PresentationService, DatabaseService, BreadcrumbService, AlertService, ConfigService } from '@app/core/services';
import { Router } from '@angular/router';
import { SystemStats } from '@app/core/interface';
import * as constants from '@main/config/constants';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  resultSet = [];

  collectionId: number;
  collectionResultSet = [];

  navCollapsed = false;
  statsCollapsed = true;

  // SYSTEM STATS
  rowCount = 0;
  activatedCount = 0;
  favoriteCount = 0;
  systemCount = 0;
  sharedCount = 45;

  constructor(
    private router: Router,
    private utils: UtilsService,
    private alertService: AlertService,
    private configService: ConfigService,
    private messageService: MessageService,
    private databaseService: DatabaseService,
    private breadcrumbService: BreadcrumbService,
    private presentationService: PresentationService
  ) { }

  ngOnInit() {
    this.presentationService._statsCollapsed.subscribe((result) => this.statsCollapsed = result);

    // Bootup fetch store.
    this.databaseService.watchCollectionId$.subscribe((collectionId: number) => {
      if (collectionId) {
        this.collectionId = collectionId;
        this.databaseService.setWhere('collection_id', collectionId).run();
        this.breadcrumbService.setNavigation(collectionId, this.collectionResultSet);
      } else {
        this.databaseService.run();
      }
    });

    // Reloads changes when collections are created/deleted.
    this.databaseService.watchCollection$.subscribe((result) => {
      this.collectionResultSet = result;
      if (this.collectionId) {
        this.breadcrumbService.setNavigation(this.collectionId, result);
      }
      this.resultSet = this.utils.expandEntities(result);
    });

    this.databaseService.watchSystemStats$.subscribe((result: SystemStats | any) => {
      this.rowCount = (result?.rowCount?.total) ? result.rowCount.total : 0;
      this.favoriteCount = (result?.favoriteCount?.total) ? result.favoriteCount.total : 0;
      this.systemCount = (result?.systemCount?.total) ? result.systemCount.total : 0;
      this.activatedCount = (result?.activatedCount?.total) ? result.activatedCount.total : 0;
    });
  }

  handleAddFonts(event: Event): void {
    const target = event.target as HTMLInputElement;
    const collectionId = Number(target.dataset.id);

    const config = this.configService.get(constants.STORE_SETTINGS);
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
    this.messageService.scanFiles(options, collectionId).then(this.utils.delay(1e3)).then(() => {
      this.messageService.updateCollectionCount(collectionId).then((result) => this.resultSet = this.utils.expandEntities(result));
      this.presentationService.setLoadingSpinner(false);
      this.alertService.dismiss();
      this.messageService.log(`Added files to collection id #${collectionId}.`, 1);
    });
  }

  openFolders(collectionId: number, options: any): void {
    this.presentationService.setLoadingSpinner(true);
    this.alertService.info('Adding fonts please wait..', 1e3, true);
    this.messageService.scanFolders(options, collectionId).then(this.utils.delay(1e3)).then(() => {
      this.messageService.updateCollectionCount(collectionId).then((result) => this.resultSet = this.utils.expandEntities(result));
      this.presentationService.setLoadingSpinner(false);
      this.alertService.dismiss();
      this.messageService.log(`Added folders to collection id #${collectionId}.`, 1);
    });
  }

  handleTitleInput(event: KeyboardEvent | Event | any): void {
    const target = event.target as HTMLInputElement;
    const collectionId = Number(target.dataset.id);

    this.messageService.updateCollection(collectionId, { title: target.value }).then((result) => {
      if (collectionId === this.collectionId) {
        this.databaseService.setCollectionId(collectionId);
        this.databaseService.setCollection(result);
        this.breadcrumbService.setNavigation(collectionId, result);
      }
    });

    this.messageService.log(`Updated collection name ${target.value}.`, 1);

    if (event.keyCode === 13) {
      target.blur();
    }
  }

  handleNavigate(event: Event, collectionId: number): void {
    const target = event.target as HTMLInputElement;

    this.databaseService.setSearch(false);

    this.messageService.resetEnabledCollection().then(() => {

      this.messageService.updateCollection(collectionId, { enabled: target.checked }).then((result) => {

        this.databaseService.resetPage(1);

        this.databaseService.setCollectionId(collectionId);

        this.databaseService.setCollection(result);

        this.breadcrumbService.setNavigation(collectionId, result);

        this.clearSelected();

        if (this.router.url !== '/main') {
          this.router.navigate(['/main']);
        }
      });
    });
  }

  handleFocus(event: Event, collectionId: number): void {
    if (collectionId === this.collectionId) {
      return;
    }

    this.messageService.resetEnabledCollection().then(() => {

      this.messageService.updateCollection(collectionId, { enabled: true }).then((result) => {

        this.databaseService.resetPage(1);

        this.databaseService.setCollectionId(collectionId);

        this.databaseService.setCollection(result);

        this.breadcrumbService.setNavigation(collectionId, result);

        this.clearSelected();

        if (this.router.url !== '/main') {
          this.router.navigate(['/main']);
        }
      });
    });
  }

  handleCreateCollection(event: Event, parentId: number): void {
    this.presentationService.setLoadingSpinner(true);

    this.messageService.createCollection(parentId).then((result) => {

      this.databaseService.setCollection(result);

      this.presentationService.setLoadingSpinner(false);

      this.messageService.log(`Created new sub collection in #${parentId}.`, 1);
    });
  }

  handleDeleteCollection(event: Event): void {
    const target = event.target as HTMLInputElement;
    const id = Number(target.dataset.id);

    this.presentationService.setLoadingSpinner(true);

    this.messageService.deleteCollection(id).then((result) => {

      this.databaseService.setCollection(result);

      this.presentationService.setLoadingSpinner(false);

      this.messageService.log(`Deleted collection id #${id}.`, 1);
    });
  }

  toggleCollapse(event: Event): void {
    const target = event.target as HTMLInputElement;
    const item = target.parentElement.parentElement as HTMLElement;

    const collectionId = Number(item.getAttribute('data-collection'));

    const hasWidget: boolean = target.hasAttribute('data-widget');
    const isCollapsed: boolean = item.classList.contains('isCollapsed');

    if (isCollapsed) {
      item.classList.remove('isCollapsed');
      target.innerHTML = 'arrow_drop_down';
    } else {
      item.classList.add('isCollapsed');
      target.innerHTML = 'arrow_right';
    }

    if (collectionId) {
      this.messageService.updateCollection(collectionId, { collapsed: isCollapsed ? false : true });
    }

    if (hasWidget) {
      this.presentationService.setStatsCollapsed(isCollapsed ? false : true);
    }
  }

  toggleCollapseAll(): void {
    this.navCollapsed = !this.navCollapsed;

    const sections = document.querySelectorAll('figure[data-collection]');
    if (!sections?.length) {
      return;
    }

    sections.forEach((figure: HTMLElement) => {
      const collectionId = Number(figure.getAttribute('data-collection'));

      const caption = figure?.firstChild as HTMLElement;
      const spanArrow = (!caption.childNodes.length) ? caption : caption?.firstChild as HTMLElement;

      if (!spanArrow) {
        return;
      }

      if (this.navCollapsed) {
        this.messageService.updateCollection(collectionId, { collapsed: true });

        if (!figure.classList.contains('isCollapsed')) {
          figure.classList.add('isCollapsed');
        }
        spanArrow.innerHTML = 'arrow_right';
        this.presentationService.setStatsCollapsed(true);
      } else {
        this.messageService.updateCollection(collectionId, { collapsed: false });

        if (figure.classList.contains('isCollapsed')) {
          figure.classList.remove('isCollapsed');
        }
        spanArrow.innerHTML = 'arrow_drop_down';
        this.presentationService.setStatsCollapsed(false);
      }
    });
  }

  handleClickSystemScan(event: Event): void {
    this.alertService.info('Searching system fonts please wait..');
    this.presentationService.setLoadingSpinner(true);
    this.messageService.syncSystemFonts().then((result: any) => {
      this.messageService.log(`Fetched system fonts found #${result.systemCount.total} total.`, 1);
      this.presentationService.setLoadingSpinner(false);
      this.alertService.success(`Found a total of ${result.systemCount.total} system fonts.`);
      this.databaseService.setSystemStats(result);
    }).catch((err) => { });
  }

  handleClickSyncActivated(event: Event): void {
    this.alertService.info('Searching system fonts please wait..');
    this.presentationService.setLoadingSpinner(true);
    this.messageService.syncActivatedFonts().then((result: any) => {
      const message = `Fetched system fonts found #${result.affected} total.`;
      this.alertService.info(message);
      this.messageService.log(message, 1);
      this.presentationService.setLoadingSpinner(false);
    }).catch((err) => { });
  }

  /**
   * System Statistics
   */

  handleClickAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parent = target.parentNode as HTMLElement;

    this.databaseService.resetWhere().run();

    this.clearChecked();
    this.clearSelected();
    this.toggleSelected(parent);

    this.breadcrumbService.set([{
      title: 'System Statistics',
      link: '/main'
    }, {
      title: 'Font Count',
      link: ''
    }]);
  }

  handleClickFavorites(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parent = target.parentNode as HTMLElement;

    this.databaseService.setWhere('store.favorite', 1).run();

    this.clearChecked();
    this.clearSelected();
    this.toggleSelected(parent);

    this.breadcrumbService.set([{
      title: 'System Statistics',
      link: '/main'
    }, {
      title: 'My Favorites',
      link: ''
    }]);
  }

  handleClickSystem(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parent = target.parentNode as HTMLElement;

    this.databaseService.setWhere('store.system', 1).run();

    this.clearChecked();
    this.clearSelected();
    this.toggleSelected(parent);

    this.breadcrumbService.set([{
      title: 'System Statistics',
      link: '/main'
    }, {
      title: 'System Fonts',
      link: ''
    }]);
  }

  handleClickActivated(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parent = target.parentNode as HTMLElement;

    this.databaseService.setWhere('store.activated', 1).run();

    this.clearChecked();
    this.clearSelected();
    this.toggleSelected(parent);

    this.breadcrumbService.set([{
      title: 'System Statistics',
      link: '/main'
    }, {
      title: 'Activated Fonts',
      link: ''
    }]);
  }

  clearChecked(): void {
    const inputs = document.querySelectorAll('input[data-collection]');
    inputs.forEach((el: HTMLInputElement) => el.checked = false);
  }

  clearSelected(): void {
    const elms = document.querySelectorAll('a.stats');
    elms.forEach((el: HTMLElement) => el.classList.remove('selected'));
  }

  toggleSelected(el: HTMLElement): void {
    if (!el.classList.contains('selected')) {
      el.classList.add('selected');
    }
  }
}
