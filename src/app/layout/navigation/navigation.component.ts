import { Component, OnInit } from '@angular/core';
import { UtilsService, MessageService, PresentationService, DatabaseService, BreadcrumbService, AlertService } from '@app/core/services';
import { Router } from '@angular/router';
import { SystemStats } from '@app/core/interface';

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
      this.rowCount = (result.rowCount && result.rowCount.total) ? result.rowCount.total : 0;
      this.favoriteCount = (result.favoriteCount && result.favoriteCount.total) ? result.favoriteCount.total : 0;
      this.systemCount = (result.systemCount && result.systemCount.total) ? result.systemCount.total : 0;
      this.activatedCount = (result.activatedCount && result.activatedCount.total) ? result.activatedCount.total : 0;
    });
  }

  handleAddFonts(event: Event): void {
    const target = event.target as HTMLInputElement;
    const collectionId = Number(target.dataset.id);

    const settings = {
      type: 'question',
      buttons: ['Cancel', 'Select files', 'Select folders'],
      defaultId: 2,
      title: 'Select Fonts',
      message: 'Do you want to add files or folders?'
    };

    this.messageService.showMessageBox(settings).then((response: object | any) => {
      if (response && response.response) {
        const isFiles = (response.response === 1) ? true : false;
        const options = (isFiles) ? { properties: ['openFile', 'multiSelections'] } : { properties: ['openDirectory', 'multiSelections'] };
        this.messageService.showOpenDialog(options).then((resp: object | any) => {
          if (!resp || !resp.filePaths) {
            return;
          }
          if (isFiles) {
            this.openFiles(collectionId, resp);
          } else {
            this.openFolders(collectionId, resp);
          }
        });
      }
    });
  }

  openFiles(collectionId: number, response: any): void {
    this.presentationService.setLoadingSpinner(true);
    this.alertService.info('Adding fonts please wait..', 1e3, true);
    this.messageService.scanFiles(response.filePaths, collectionId).then(this.utils.delay(1e3)).then(() => {
      this.messageService.updateCollectionCount(collectionId).subscribe((result) => this.resultSet = this.utils.expandEntities(result));
      this.presentationService.setLoadingSpinner(false);
      this.alertService.dismiss();
      this.messageService.log(`Added files to collection id #${collectionId}.`, 1);
    });
  }

  openFolders(collectionId: number, response: any): void {
    this.presentationService.setLoadingSpinner(true);
    this.alertService.info('Adding fonts please wait..', 1e3, true);
    this.messageService.scanFolders(response.filePaths, collectionId).then(this.utils.delay(1e3)).then(() => {
      this.messageService.updateCollectionCount(collectionId).subscribe((result) => this.resultSet = this.utils.expandEntities(result));
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

    // const target = event.target as HTMLInputElement;
    // const parent = target.parentNode.previousSibling.firstChild as HTMLInputElement;
    // parent.checked = true;

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

    this.messageService.createCollection(parentId).subscribe((result) => {

      this.databaseService.setCollection(result);

      this.presentationService.setLoadingSpinner(false);

      this.messageService.log(`Created new sub collection in #${parentId}.`, 1);
    });
  }

  handleDeleteCollection(event: Event): void {
    const target = event.target as HTMLInputElement;
    const id = Number(target.dataset.id);

    this.presentationService.setLoadingSpinner(true);

    this.messageService.deleteCollection(id).subscribe((result) => {

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
    sections.forEach((item) => {
      const id = Number(item.getAttribute('data-collection'));
      const icon = item.firstChild.firstChild as HTMLElement;

      if (this.navCollapsed) {
        this.messageService.updateCollection(id, { collapsed: true });

        if (!item.classList.contains('isCollapsed')) {
          item.classList.add('isCollapsed');
        }
        icon.innerHTML = 'arrow_right';
        this.presentationService.setStatsCollapsed(true);
      } else {
        this.messageService.updateCollection(id, { collapsed: false });

        if (item.classList.contains('isCollapsed')) {
          item.classList.remove('isCollapsed');
        }
        icon.innerHTML = 'arrow_drop_down';
        this.presentationService.setStatsCollapsed(false);
      }
    });
  }

  /**
   * System Stats
   */

  handleClickAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parent = target.parentNode as HTMLElement;

    this.databaseService.resetWhere().run();

    this.clearChecked();
    this.clearSelected();
    this.toggleSelected(parent);

    this.breadcrumbService.set([{
      title: 'Font Collection',
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
      title: 'Font Collection',
      link: '/main'
    }, {
      title: 'Favorites',
      link: ''
    }]);
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

  handleClickSystem(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parent = target.parentNode as HTMLElement;

    this.databaseService.setWhere('store.system', 1).run();

    this.clearChecked();
    this.clearSelected();
    this.toggleSelected(parent);

    this.breadcrumbService.set([{
      title: 'Font Collection',
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
      title: 'Font Collection',
      link: '/main'
    }, {
      title: 'Activated',
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
