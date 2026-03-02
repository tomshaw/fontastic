import { Component, OnInit } from '@angular/core';
import { UtilsService, MessageService, PresentationService, DatabaseService, BreadcrumbService, AlertService } from '@app/core/services';
import { Router } from '@angular/router';
import { SystemStats } from '@app/core/interface';

@Component({
  standalone: false,
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  resultSet: any[] = [];
  collectionResultSet: any[] = [];

  // Selection tracking
  activeFilter: string = '';
  activeCollection: number = 0;
  activeChild: number = 0;

  navCollapsed: boolean = false;

  // System stats
  rowCount: number = 0;
  activatedCount: number = 0;
  favoriteCount: number = 0;
  systemCount: number = 0;

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
    // Restore collection selection on boot
    this.databaseService.watchCollectionId$.subscribe((id: number) => {
      if (id) {
        this.activeChild = id;
        this.activeFilter = '';
        this.databaseService.setWhere('collection_id', id).run();
        this.breadcrumbService.setNavigation(id, this.collectionResultSet);
      } else {
        this.databaseService.run();
      }
    });

    // Reload tree when collections change
    this.databaseService.watchCollection$.subscribe((result) => {
      this.collectionResultSet = result;
      if (this.activeChild) {
        this.breadcrumbService.setNavigation(this.activeChild, result);
      }
      this.resultSet = this.utils.expandEntities(result);
    });

    // System stats
    this.databaseService.watchSystemStats$.subscribe((result: SystemStats | any) => {
      this.rowCount = result.rowCount?.total ?? 0;
      this.favoriteCount = result.favoriteCount?.total ?? 0;
      this.systemCount = result.systemCount?.total ?? 0;
      this.activatedCount = result.activatedCount?.total ?? 0;
    });
  }

  // ─── Library Filters ─────────────────────────────────────────

  handleClickAll(event: Event) {
    this.clearSelection();
    this.activeFilter = 'all';
    this.databaseService.resetWhere().run();
    this.breadcrumbService.set([
      { title: 'Library', link: '/main' },
      { title: 'All Fonts', link: '' }
    ]);
    this.navigateToMain();
  }

  handleClickFavorites(event: Event) {
    this.clearSelection();
    this.activeFilter = 'favorites';
    this.databaseService.setWhere('store.favorite', 1).run();
    this.breadcrumbService.set([
      { title: 'Library', link: '/main' },
      { title: 'Favorites', link: '' }
    ]);
    this.navigateToMain();
  }

  handleClickSystem(event: Event) {
    this.clearSelection();
    this.activeFilter = 'system';
    this.databaseService.setWhere('store.system', 1).run();
    this.breadcrumbService.set([
      { title: 'Library', link: '/main' },
      { title: 'System Fonts', link: '' }
    ]);
    this.navigateToMain();
  }

  handleClickActivated(event: Event) {
    this.clearSelection();
    this.activeFilter = 'activated';
    this.databaseService.setWhere('store.activated', 1).run();
    this.breadcrumbService.set([
      { title: 'Library', link: '/main' },
      { title: 'Activated', link: '' }
    ]);
    this.navigateToMain();
  }

  handleClickSystemScan(event: Event) {
    event.stopPropagation();
    this.alertService.info('Scanning system fonts, please wait...', false);
    this.presentationService.setLoadingSpinner(true);
    this.presentationService.setLoadingMessage('Scanning system fonts...');

    this.messageService.fetchSystemFonts().then((result: any) => {
      this.presentationService.setLoadingSpinner(false);
      this.presentationService.setLoadingMessage('');
      this.alertService.success(`Found ${result.systemCount.total} system fonts.`, false, 5e3);
      this.databaseService.setSystemStats(result);
      this.messageService.log(`Fetched system fonts found #${result.systemCount.total} total.`, 1);
    }).catch(() => {
      this.presentationService.setLoadingSpinner(false);
      this.presentationService.setLoadingMessage('');
    });
  }

  // ─── Collection Selection ────────────────────────────────────

  handleSelectCollection(item: any) {
    this.clearSelection();
    this.activeCollection = item.id;

    this.messageService.resetEnabledCollection().then(() => {
      this.messageService.updateCollection(item.id, { enabled: true }).then(() => {
        this.databaseService.resetPage(1);
        this.databaseService.setCollectionId(item.id);
        this.navigateToMain();
      });
    });
  }

  handleSelectChild(child: any) {
    this.clearSelection();
    this.activeChild = child.id;

    this.messageService.resetEnabledCollection().then(() => {
      this.messageService.updateCollection(child.id, { enabled: true }).then(() => {
        this.databaseService.resetPage(1);
        this.databaseService.setCollectionId(child.id);
        this.navigateToMain();
      });
    });
  }

  // ─── Collection Management ───────────────────────────────────

  handleCreateCollection(event: Event, parentId: number): void {
    event.stopPropagation();
    this.presentationService.setLoadingSpinner(true);
    this.presentationService.setLoadingMessage('Creating collection...');

    this.messageService.createCollection(parentId).subscribe((result) => {
      this.databaseService.setCollection(result);
      this.presentationService.setLoadingSpinner(false);
      this.presentationService.setLoadingMessage('');
      this.messageService.log(`Created new collection under #${parentId}.`, 1);
    });
  }

  handleDeleteCollection(event: Event, id: number): void {
    event.stopPropagation();
    this.presentationService.setLoadingSpinner(true);
    this.presentationService.setLoadingMessage('Deleting collection...');

    this.messageService.deleteCollection(id).subscribe((result) => {
      this.databaseService.setCollection(result);
      this.presentationService.setLoadingSpinner(false);
      this.presentationService.setLoadingMessage('');

      // If we deleted the active collection, reset
      if (this.activeChild === id || this.activeCollection === id) {
        this.clearSelection();
        this.activeFilter = 'all';
        this.databaseService.resetWhere().run();
      }

      this.messageService.log(`Deleted collection #${id}.`, 1);
    });
  }

  handleTitleInput(event: KeyboardEvent | Event | any): void {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    const id = Number(target.dataset.id);

    this.messageService.updateCollection(id, { title: target.value });
    this.messageService.log(`Updated collection name ${target.value}.`, 1);

    if (event.keyCode === 13) {
      target.blur();
    }
  }

  handleAddFonts(event: Event, collectionId: number): void {
    event.stopPropagation();

    const options = {
      type: 'question',
      buttons: ['Cancel', 'Select Files', 'Select Folders'],
      defaultId: 2,
      title: 'Add Fonts',
      message: 'Do you want to add files or folders?'
    };

    this.messageService.showMessageBox(options).then((response: any) => {
      if (response?.response) {
        const isFiles = response.response === 1;
        const dialogOptions = isFiles
          ? { properties: ['openFile', 'multiSelections'] }
          : { properties: ['openDirectory', 'multiSelections'] };

        this.messageService.showOpenDialog(dialogOptions).then((dialogResponse: any) => {
          if (!dialogResponse?.filePaths) return;
          if (isFiles) {
            this.scanFiles(collectionId, dialogResponse);
          } else {
            this.scanFolders(collectionId, dialogResponse);
          }
        });
      }
    });
  }

  // ─── Collapse / Expand ───────────────────────────────────────

  toggleCollapse(event: Event, item: any): void {
    event.stopPropagation();
    item.collapsed = !item.collapsed;
    this.messageService.updateCollection(item.id, { collapsed: item.collapsed });
  }

  toggleCollapseAll(): void {
    this.navCollapsed = !this.navCollapsed;
    for (const item of this.resultSet) {
      item.collapsed = this.navCollapsed;
      this.messageService.updateCollection(item.id, { collapsed: this.navCollapsed });
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────

  private clearSelection(): void {
    this.activeFilter = '';
    this.activeCollection = 0;
    this.activeChild = 0;
  }

  private navigateToMain(): void {
    if (this.router.url !== '/main') {
      this.router.navigate(['/main']);
    }
  }

  private scanFiles(collectionId: number, response: any): void {
    this.presentationService.setLoadingSpinner(true);
    this.presentationService.setLoadingMessage('Importing fonts...');

    this.messageService.scanFiles(response.filePaths, collectionId).then(() => {
      this.messageService.updateCollectionCount(collectionId).subscribe((result) => {
        this.resultSet = this.utils.expandEntities(result);
      });
      this.databaseService.run();
      this.databaseService.fetchSystemStats();
      this.presentationService.setLoadingSpinner(false);
      this.presentationService.setLoadingMessage('');
      this.messageService.log(`Added files to collection #${collectionId}.`, 1);
    });
  }

  private scanFolders(collectionId: number, response: any): void {
    this.presentationService.setLoadingSpinner(true);
    this.presentationService.setLoadingMessage('Importing fonts...');

    this.messageService.scanFolders(response.filePaths, collectionId).then(() => {
      this.messageService.updateCollectionCount(collectionId).subscribe((result) => {
        this.resultSet = this.utils.expandEntities(result);
      });
      this.databaseService.run();
      this.databaseService.fetchSystemStats();
      this.presentationService.setLoadingSpinner(false);
      this.presentationService.setLoadingMessage('');
      this.messageService.log(`Added folders to collection #${collectionId}.`, 1);
    });
  }
}
