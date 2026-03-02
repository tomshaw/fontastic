import { Component, OnInit } from '@angular/core';
import { UtilsService, MessageService, PresentationService, DatabaseService, BreadcrumbService, AlertService } from '@app/core/services';
import { Router } from '@angular/router';
import { SystemStats } from '@app/core/interface';

/**
 * Component Methods
 * 
 * - ngOnInit
 * 
 *   this.presentationService._statsCollapsed
 *   this.databaseService.watchCollectionId$
 *   this.databaseService.watchCollection$
 *   this.databaseService.watchSystemStats$
 * 
 * - handleAddFonts
 * - openFiles
 * - openFolders
 * 
 * - handleTitleInput
 * - handleNavigate
 * 
 * - handleCreateCollection
 * - handleDeleteCollection
 * 
 * - toggleCollapse
 * - toggleCollapseAll
 * 
 * - handleClickAll
 * - handleClickFavorites
 * - handleClickSystemScan
 * - handleClickSystem
 * - handleClickActivated
 * 
 * - clearChecked
 * - clearSelected
 * - toggleSelected
 * 
 */

@Component({
  standalone: false,
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  resultSet: any[] = [];

  collectionId!: number;
  collectionResultSet: any[] = [];

  navCollapsed: boolean = false; // open/close all
  statsCollapsed: boolean = true;

  // SYSTEM STATS
  rowCount: number = 0;
  activatedCount: number = 0;
  favoriteCount: number = 0;
  systemCount: number = 0;
  sharedCount: number = 45;

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

    this.presentationService._statsCollapsed.subscribe((result) => {
      console.log('this.presentationService._statsCollapsed', result);
      this.statsCollapsed = result;
    });

    // Bootup fetch store.
    this.databaseService.watchCollectionId$.subscribe((id: number) => {
      console.log('WATCH-COLLECTION-ID', id);
      if (id) {
        this.collectionId = id;
        this.databaseService.setWhere('collection_id', id).run();
        this.breadcrumbService.setNavigation(id, this.collectionResultSet);
      } else {
        this.databaseService.run();
      }
    });

    // Reloads changes when collections are created/deleted.
    this.databaseService.watchCollection$.subscribe((result) => {
      console.log('WATCH-COLLECTION-RESULT-SET', result);
      
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

    const options = {
      type: 'question',
      buttons: ['Cancel', 'Select files', 'Select folders'],
      defaultId: 2,
      title: 'Select Fonts',
      message: 'Do you want to add files or folders?'
    };

    this.messageService.showMessageBox(options).then((response: object | any) => {
      if (response && response.response) {
        const isFiles = (response.response === 1) ? true : false;
        const options = (isFiles) ? { properties: ['openFile', 'multiSelections'] } : { properties: ['openDirectory', 'multiSelections'] };
        this.messageService.showOpenDialog(options).then((response: object | any) => {
          if (!response || !response.filePaths) return;
          if (isFiles) {
            this.openFiles(collectionId, response);
          } else {
            this.openFolders(collectionId, response);
          }
        })
      }
    });
  }

  openFiles(collectionId: number, response: any): void {
    this.presentationService.setLoadingSpinner(true);
    this.messageService.scanFiles(response.filePaths, collectionId).then(() => {
      this.messageService.updateCollectionCount(collectionId).subscribe((result) => {
        this.resultSet = this.utils.expandEntities(result);
      });
      this.presentationService.setLoadingSpinner(false);
      this.messageService.log(`Added files to collection id #${collectionId}.`, 1);
    });
  }

  openFolders(collectionId: number, response: any): void {
    this.presentationService.setLoadingSpinner(true);
    this.messageService.scanFolders(response.filePaths, collectionId).then(() => {
      this.messageService.updateCollectionCount(collectionId).subscribe((result) => {
        this.resultSet = this.utils.expandEntities(result);
      });
      this.presentationService.setLoadingSpinner(false);
      this.messageService.log(`Added folders to collection id #${collectionId}.`, 1);
    });
  }

  handleTitleInput(event: KeyboardEvent | Event | any): void {
    const target = event.target as HTMLInputElement;
    const id = Number(target.dataset.id);

    this.messageService.updateCollection(id, { title: target.value });

    this.messageService.log(`Updated collection name ${target.value}.`, 1);

    if (event.keyCode == 13) {
      target.blur();
    }
  }

  handleNavigate(event: Event, collectionId: number): void {
    const target = event.target as HTMLInputElement;

    this.messageService.resetEnabledCollection().then(() => {

      this.messageService.updateCollection(collectionId, { enabled: target.checked }).then(() => {

        this.databaseService.resetPage(1);

        this.databaseService.setCollectionId(collectionId);

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
    let item = target.parentElement!.parentElement!;

    let collectionId: number = parseInt(item.getAttribute('data-collection')!);

    let hasWidget: boolean = target.hasAttribute('data-widget');
    let isCollapsed: boolean = item.classList.contains('isCollapsed');

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
      let id: number = parseInt(item.getAttribute('data-collection')!);
      let icon = <HTMLElement>item.firstChild!.firstChild;

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

  handleClickAll(event: Event) {
    const target = event.target as HTMLInputElement;
    let parent = target.parentNode;

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

  handleClickFavorites(event: Event) {
    const target = event.target as HTMLInputElement;
    let parent = target.parentNode;

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

  handleClickSystemScan(event: Event) {
    this.alertService.info('Searching system fonts please wait..', false);

    this.presentationService.setLoadingSpinner(true);

    this.messageService.fetchSystemFonts().then((result: any) => {
      this.messageService.log(`Fetched system fonts found #${result.systemCount.total} total.`, 1);
      this.presentationService.setLoadingSpinner(false);
      this.alertService.success(`Found a total of ${result.systemCount.total} system fonts.`, false, 5e3);
      this.databaseService.setSystemStats(result);
    }).catch((err) => { });
  }

  handleClickSystem(event: Event) {
    const target = event.target as HTMLInputElement;
    let parent = target.parentNode;

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

  handleClickActivated(event: Event) {
    const target = event.target as HTMLInputElement;
    let parent = target.parentNode;

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

  clearChecked() {
    let inputs = document.querySelectorAll('input[data-collection]');
    inputs.forEach((item: any) => item.checked = false);
  }

  clearSelected() {
    let links = document.querySelectorAll('a.system');
    links.forEach((item: any) => item.classList.remove('selected'));
  }

  toggleSelected(item: any) {
    if (!item.classList.contains('selected')) {
      item.classList.add('selected');
    }
  }
}
