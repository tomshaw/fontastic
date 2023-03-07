import { Component, OnDestroy, OnInit } from '@angular/core';
import { UtilsService, MessageService, PresentationService, DatabaseService, BreadcrumbService, ModalService } from '@app/core/services';
import { SystemStats } from '@main/types';
import { Collection } from '@main/database/entity/Collection.schema';

type CollectionWithChildren<T> = Partial<T> & { children: Collection[] };

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  resultSet: CollectionWithChildren<Collection>[] = [];

  collectionId: number;

  toggleDetails = false;

  statsCollapsed = true;
  foldersCollapsed = true;
  optionsCollapsed = true;
  toggleCollapsed = false;

  rowCount = 0;
  activatedCount = 0;
  favoriteCount = 0;
  systemCount = 0;

  constructor(
    private utils: UtilsService,
    private messageService: MessageService,
    private modalService: ModalService,
    private databaseService: DatabaseService,
    private breadcrumbService: BreadcrumbService,
    private presentationService: PresentationService
  ) { }

  ngOnInit() {
    this.presentationService._statsCollapsed.subscribe((result) => this.statsCollapsed = result);
    this.presentationService._foldersCollapsed.subscribe((result) => this.foldersCollapsed = result);
    this.presentationService._optionsCollapsed.subscribe((result) => this.optionsCollapsed = result);

    // Bootup fetch store.
    this.databaseService.watchCollectionId$.subscribe((collectionId: number) => {
      if (collectionId) {
        this.collectionId = collectionId;
        this.databaseService.setWhere('collection_id', collectionId).run();
      } else {
        this.databaseService.run();
      }
    });

    this.databaseService.watchCollectionResultSet$.subscribe((results: Collection[]) => {
      if (results?.length) {
        this.breadcrumbService.setNavigation(this.collectionId, results);
        const copy = results.map(item => ({ ...item }));
        this.resultSet = this.utils.listToTree(copy);
      }
    });

    this.databaseService.watchSystemStats$.subscribe((result: SystemStats) => {
      this.rowCount = (result?.rowCount) ? result.rowCount : 0;
      this.favoriteCount = (result?.favoriteCount) ? result.favoriteCount : 0;
      this.systemCount = (result?.systemCount) ? result.systemCount : 0;
      this.activatedCount = (result?.activatedCount) ? result.activatedCount : 0;
    });
  }

  ngOnDestroy() {
    console.log('Navigation destroyed: ' + Date.now());
  }

  handleNavigate(event: Event, collectionId: number): void {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    const parent = target.parentElement.parentElement as HTMLElement;

    if (collectionId === this.collectionId) {
      return;
    }

    this.databaseService.stats = false;
    this.databaseService.search = false;

    this.toggleSelected(parent);
    this.clearSelectedStats();

    this.messageService.collectionEnable(collectionId, { enabled: true }).then((results: Collection[]) => {
      this.databaseService.resetPage(1);
      this.databaseService.setCollectionId(collectionId);
      this.databaseService.setCollectionResultSet(results);
    });
  }

  handleCollapse(event: Event, collectionId: number): void {
    event.stopPropagation();

    const target = event.target as HTMLElement;
    const element = target.parentElement.parentElement.parentElement as HTMLElement;

    const isOpen: boolean = element.hasAttribute('open');

    this.messageService.collectionUpdate(collectionId, { collapsed: !isOpen });
  }

  handleUpdate(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.modalService.open('collection-update');
  }

  /**
   * End collection methods 
   */

  toggleCollapse(event: Event): void {
    const target = event.target as HTMLInputElement;
    const item = target.parentElement.parentElement as HTMLElement;

    const collectionId = Number(item.getAttribute('data-collection'));

    const isFigStats: boolean = target.hasAttribute('data-figure-stats');
    const isFigFolders: boolean = target.hasAttribute('data-figure-folders');
    const isFigOptions: boolean = target.hasAttribute('data-figure-options');

    const isCollapsed: boolean = item.classList.contains('collapsed');

    if (isCollapsed) {
      item.classList.remove('collapsed');
      //target.innerHTML = 'arrow_right';
    } else {
      item.classList.add('collapsed');
      //target.innerHTML = 'arrow_drop_down';
    }

    if (collectionId) {
      this.messageService.collectionUpdate(collectionId, { collapsed: isCollapsed ? false : true });
    }

    if (isFigStats) {
      this.presentationService.setStatsCollapsed(isCollapsed ? false : true);
    }

    if (isFigFolders) {
      this.presentationService.setFoldersCollapsed(isCollapsed ? false : true);
    }

    if (isFigOptions) {
      this.presentationService.setOptionsCollapsed(isCollapsed ? false : true);
    }

    this.presentationService.saveLayoutSettings();
  }

  toggleFigureCollapse(): void {
    this.toggleCollapsed = !this.toggleCollapsed;

    this.statsCollapsed = this.toggleCollapsed;
    this.foldersCollapsed = this.toggleCollapsed;
    this.optionsCollapsed = this.toggleCollapsed;

    const toggle = this.toggleCollapsed;

    this.presentationService.setStatsCollapsed(toggle);
    this.presentationService.setFoldersCollapsed(toggle);
    this.presentationService.setOptionsCollapsed(toggle);
  }

  toggleDetailsOpen(): void {
    this.toggleDetails = !this.toggleDetails;

    const elems = document.querySelectorAll('details') as NodeListOf<HTMLElement>;

    const ids = [];
    elems.forEach((element: HTMLElement) => {
      ids.push(element.getAttribute('data-id'));
      if (this.toggleDetails) {
        if (!element.hasAttribute('open')) {
          element.setAttribute('open', '1');
        }
      } else {
        if (element.hasAttribute('open')) {
          element.removeAttribute('open');
        }
      }
    });

    this.messageService.collectionUpdateIds(ids, { collapsed: this.toggleDetails });
  }

  handleClickAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parent = target.parentNode as HTMLElement;

    this.databaseService.stats = true;
    this.databaseService.search = false;
    this.databaseService.resetWhere().run();

    this.clearSelectedStats();
    this.clearSelectedDetails();
    this.toggleSelected(parent);

    this.breadcrumbService.set([{
      title: 'System Statistics',
      link: '/main',
      type: 'collection'
    }, {
      title: 'Font Count',
      link: '',
      type: 'collection'
    }]);
  }

  handleClickFavorites(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parent = target.parentNode as HTMLElement;

    this.databaseService.stats = true;
    this.databaseService.search = false;
    this.databaseService.setWhere('store.favorite', 1).run();

    this.clearSelectedStats();
    this.clearSelectedDetails();
    this.toggleSelected(parent);

    this.breadcrumbService.set([{
      title: 'System Statistics',
      link: '/main',
      type: 'collection'
    }, {
      title: 'My Favorites',
      link: '',
      type: 'collection'
    }]);
  }

  handleClickSystem(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parent = target.parentNode as HTMLElement;

    this.databaseService.stats = true;
    this.databaseService.search = false;
    this.databaseService.setWhere('store.system', 1).run();

    this.clearSelectedStats();
    this.clearSelectedDetails();
    this.toggleSelected(parent);

    this.breadcrumbService.set([{
      title: 'System Statistics',
      link: '/main',
      type: 'collection'
    }, {
      title: 'System Fonts',
      link: '',
      type: 'collection'
    }]);
  }

  handleClickActivated(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parent = target.parentNode as HTMLElement;

    this.databaseService.stats = true;
    this.databaseService.search = false;
    this.databaseService.setWhere('store.activated', 1).run();

    this.clearSelectedStats();
    this.clearSelectedDetails();
    this.toggleSelected(parent);

    this.breadcrumbService.set([{
      title: 'System Statistics',
      link: '/main',
      type: 'collection'
    }, {
      title: 'Activated Fonts',
      link: '',
      type: 'collection'
    }]);
  }

  clearSelectedStats(): void {
    const elms = document.querySelectorAll('ul.statistics > li > a') as NodeListOf<HTMLElement>;
    elms.forEach((el: HTMLElement) => el.classList.remove('selected'));
  }

  clearSelectedDetails(): void {
    const elms = document.querySelectorAll('details > summary') as NodeListOf<HTMLElement>;
    elms.forEach((el: HTMLElement) => el.classList.remove('selected'));
  }

  toggleSelected(el: HTMLElement): void {
    if (!el.classList.contains('selected')) {
      el.classList.add('selected');
    }
  }
}
