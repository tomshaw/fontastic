import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { ElectronService } from '../electron/electron.service';
import { MessageService } from '../message/message.service';
import { PresentationService } from '../presentation/presentation.service';
import { StorageType } from '@main/enums';
import type { Collection } from '@main/database/entity/Collection.schema';
import type { Logger } from '@main/database/entity/Logger.schema';
import type { Store, StoreManyAndCountType } from '@main/database/entity/Store.schema';
import type { FontMetrics, SystemStats } from '@main/types';
import type { SmartCollection } from '@main/database/entity/SmartCollection.schema';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private electron = inject(ElectronService);
  private message = inject(MessageService);
  private presentation = inject(PresentationService);

  // Reactive state
  readonly collections = signal<Collection[]>([]);
  readonly smartCollections = signal<SmartCollection[]>([]);
  readonly activeSmartCollectionId = signal<number | null>(null);
  readonly parentId = signal<number | null>(null);
  readonly collectionId = signal<number | null>(null);
  readonly stores = signal<Store[]>([]);
  readonly storeCount = signal(0);
  readonly systemStats = signal<SystemStats | null>(null);

  readonly storeId = signal<number | null>(null);
  readonly store = signal<Store | null>(null);
  readonly fontMetrics = signal<FontMetrics | null>(null);
  readonly glyphs = signal<number[]>([]);
  readonly activeFilter = signal<string | null>(null);
  readonly activeSearchWhere = signal<{ key: string; value: any }[] | null>(null);
  readonly collectionCount = computed(() => this.collections().length);
  readonly collection = computed(() => this.collections().find((c) => c.id === this.collectionId()) ?? null);

  // Pagination
  readonly currentPage = signal(1);
  readonly pageSize = signal(50);
  readonly totalPages = computed(() => {
    const count = this.storeCount();
    const size = this.pageSize();
    return Math.max(1, Math.ceil(count / size));
  });

  private async track<T>(operation: Promise<T>): Promise<T> {
    this.presentation.startLoading();
    try {
      return await operation;
    } finally {
      this.presentation.stopLoading();
    }
  }

  selectParent(parentId: number) {
    this.parentId.set(parentId);
    this.collectionId.set(parentId);
    this.activeFilter.set(null);
    this.activeSearchWhere.set(null);
    this.activeSmartCollectionId.set(null);
    this.currentPage.set(1);
  }

  selectChild(child: Collection) {
    this.parentId.set(this.findRootParentId(child));
    this.collectionId.set(child.id);
    this.activeFilter.set(null);
    this.activeSearchWhere.set(null);
    this.activeSmartCollectionId.set(null);
    this.currentPage.set(1);
  }

  private findRootParentId(collection: Collection): number {
    const all = this.collections();
    let current = collection;
    while (current.parent_id !== 0) {
      const parent = all.find((c) => c.id === current.parent_id);
      if (!parent) break;
      current = parent;
    }
    return current.id;
  }

  selectSmartCollection(id: number) {
    this.parentId.set(null);
    this.collectionId.set(null);
    this.activeFilter.set(null);
    this.activeSearchWhere.set(null);
    this.activeSmartCollectionId.set(id);
    this.currentPage.set(1);
    this.fetchCurrentPage();
  }

  selectFilter(filter: string) {
    this.parentId.set(null);
    this.collectionId.set(null);
    this.activeFilter.set(filter);
    this.activeSearchWhere.set(null);
    this.activeSmartCollectionId.set(null);
    this.currentPage.set(1);

    const whereMap: Record<string, { key: string; value: number }[]> = {
      all: [],
      favorites: [{ key: 'store.favorite', value: 1 }],
      system: [{ key: 'store.system', value: 1 }],
    };

    this.fetchCurrentPage({ where: whereMap[filter] ?? [] });
  }

  goToPage(page: number) {
    const clamped = Math.max(1, Math.min(page, this.totalPages()));
    if (clamped !== this.currentPage()) {
      this.currentPage.set(clamped);
      this.fetchCurrentPage();
    }
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  firstPage() {
    this.goToPage(1);
  }

  lastPage() {
    this.goToPage(this.totalPages());
  }

  private fetchCurrentPage(extraOptions: any = {}) {
    const skip = (this.currentPage() - 1) * this.pageSize();
    const take = this.pageSize();
    const sortOrder = this.getSortOrder();

    const smartCollectionId = this.activeSmartCollectionId();
    if (smartCollectionId) {
      this.smartCollectionEvaluate(smartCollectionId, { skip, take, ...(sortOrder ? { order: sortOrder } : {}) });
      return;
    }

    const searchWhere = this.activeSearchWhere();
    if (searchWhere) {
      const searchOrder = this.activeSearchOrder();
      const order = sortOrder ?? searchOrder;
      this.storeSearch({ where: searchWhere, skip, take, ...(order ? { order } : {}) });
      return;
    }

    const collectionId = this.collectionId();
    const filter = this.activeFilter();

    const options: any = { skip, take, ...extraOptions, ...(sortOrder ? { order: sortOrder } : {}) };

    if (collectionId) {
      options.collectionId = collectionId;
    } else if (filter) {
      const whereMap: Record<string, { key: string; value: number }[]> = {
        all: [],
        favorites: [{ key: 'store.favorite', value: 1 }],
        system: [{ key: 'store.system', value: 1 }],
      };
      options.where = whereMap[filter] ?? [];
    }

    this.storeFetch(options);
  }

  constructor() {
    this.electron.ready.then(async () => {
      const [collections, smartCollections, savedCollectionId, savedStoreId, savedSortColumn, savedSortDirection] = await Promise.all([
        this.message.collectionFetch({}),
        this.message.smartCollectionFind(),
        this.message.get(StorageType.CollectionId, null),
        this.message.get(StorageType.StoreId, null),
        this.message.get(StorageType.SortColumn, null),
        this.message.get(StorageType.SortDirection, null),
      ]);

      this.collections.set(collections);
      this.smartCollections.set(smartCollections);
      console.log('System Boot:', collections);

      if (savedSortColumn) {
        this.sortColumn.set(savedSortColumn);
        this.sortDirection.set(savedSortDirection === 'DESC' ? 'DESC' : 'ASC');
      }

      if (savedCollectionId) {
        this.collectionId.set(savedCollectionId);
      }

      if (savedStoreId) {
        this.storeId.set(savedStoreId);
      }

      this.fetchSystemStats();
    });

    effect(() => {
      const collectionId = this.collectionId();
      if (Number.isInteger(collectionId)) {
        this.message.set(StorageType.CollectionId, collectionId);
        this.fetchCurrentPage();
      } else if (!this.activeSearchWhere() && !this.activeFilter()) {
        this.stores.set([]);
        this.storeCount.set(0);
      }
    });

    effect(() => {
      const storeId = this.storeId();
      if (Number.isInteger(storeId)) {
        this.message.set(StorageType.StoreId, storeId);
        this.message.storeFindOneBy({ id: storeId }).then((store) => {
          this.store.set(store);
          if (store?.file_path) {
            this.message.fontMetrics(store.file_path).then((metrics) => this.fontMetrics.set(metrics));
            this.message.fontGlyphs(store.file_path).then((glyphs) => this.glyphs.set(glyphs));
          } else {
            this.fontMetrics.set(null);
            this.glyphs.set([]);
          }
        });
      } else {
        this.store.set(null);
        this.fontMetrics.set(null);
        this.glyphs.set([]);
      }
    });
  }

  // Collection

  collectionFind(args: any): Promise<Collection[]> {
    return this.track(this.message.collectionFind(args));
  }

  collectionFindOne(args: any): Promise<Collection> {
    return this.track(this.message.collectionFindOne(args));
  }

  collectionFindOneBy(args: any): Promise<Collection> {
    return this.track(this.message.collectionFindOneBy(args));
  }

  collectionFetch(args: any): Promise<Collection[]> {
    return this.track(this.message.collectionFetch(args));
  }

  collectionCreate(args: any): Promise<Collection[]> {
    return this.track(
      this.message.collectionCreate(args).then((result) => {
        this.collections.set(result);
        console.log('Collection Created:', result);
        return result;
      }),
    );
  }

  collectionUpdate(collectionId: number, data: any): Promise<Collection[]> {
    return this.track(
      this.message.collectionUpdate(collectionId, data).then((result) => {
        this.collections.set(result);
        return result;
      }),
    );
  }

  collectionUpdateIds(ids: any[], data: any): Promise<Collection[]> {
    return this.track(
      this.message.collectionUpdateIds(ids, data).then((result) => {
        this.collections.set(result);
        return result;
      }),
    );
  }

  collectionDelete(collectionId: number): Promise<Collection[]> {
    return this.track(
      this.message.collectionDelete(collectionId).then((result) => {
        this.collections.set(result);
        return result;
      }),
    );
  }

  collectionEnable(collectionId: number, data: any): Promise<Collection[]> {
    return this.track(
      this.message.collectionEnable(collectionId, data).then((result) => {
        this.collections.set(result);
        return result;
      }),
    );
  }

  collectionUpdateCount(id: number): Promise<Collection[]> {
    return this.track(
      this.message.collectionUpdateCount(id).then((result) => {
        this.collections.set(result);
        return result;
      }),
    );
  }

  collectionUpdateCounts(): Promise<Collection[]> {
    return this.track(
      this.message.collectionUpdateCounts().then((result) => {
        this.collections.set(result);
        return result;
      }),
    );
  }

  collectionMove(collectionId: number, newParentId: number, newIndex: number): Promise<Collection[]> {
    return this.track(
      this.message.collectionMove(collectionId, newParentId, newIndex).then((result) => {
        this.collections.set(result);
        return result;
      }),
    );
  }

  // Smart Collection

  smartCollectionCreate(args: any): Promise<SmartCollection[]> {
    return this.track(
      this.message.smartCollectionCreate(args).then((result) => {
        this.smartCollections.set(result);
        return result;
      }),
    );
  }

  smartCollectionUpdate(id: number, data: any): Promise<SmartCollection[]> {
    return this.track(
      this.message.smartCollectionUpdate(id, data).then((result) => {
        this.smartCollections.set(result);
        return result;
      }),
    );
  }

  smartCollectionDelete(id: number): Promise<SmartCollection[]> {
    return this.track(
      this.message.smartCollectionDelete(id).then((result) => {
        this.smartCollections.set(result);
        if (this.activeSmartCollectionId() === id) {
          this.activeSmartCollectionId.set(null);
          this.stores.set([]);
          this.storeCount.set(0);
        }
        return result;
      }),
    );
  }

  smartCollectionEvaluate(id: number, options: any): Promise<StoreManyAndCountType> {
    return this.track(
      this.message.smartCollectionEvaluate(id, options).then((result) => {
        this.stores.set(result[0] as Store[]);
        this.storeCount.set(result[1] as number);
        return result;
      }),
    );
  }

  smartCollectionPreview(rules: any[], matchType: string): Promise<number> {
    return this.message.smartCollectionPreview(rules, matchType).then((result) => {
      return result[1] as number;
    });
  }

  // Store

  storeFind(args: any): Promise<Store[]> {
    return this.track(this.message.storeFind(args));
  }

  storeFindOne(args: any): Promise<Store> {
    return this.track(this.message.storeFindOne(args));
  }

  storeFindOneBy(args: any): Promise<Store> {
    return this.track(this.message.storeFindOneBy(args));
  }

  storeFetch(options: any): Promise<StoreManyAndCountType> {
    return this.track(
      this.message.storeFetch(options).then((result) => {
        this.stores.set(result[0] as Store[]);
        this.storeCount.set(result[1] as number);
        return result;
      }),
    );
  }

  storeSearch(options: any): Promise<StoreManyAndCountType> {
    return this.track(
      this.message.storeSearch(options).then((result) => {
        this.stores.set(result[0] as Store[]);
        this.storeCount.set(result[1] as number);
        return result;
      }),
    );
  }

  readonly activeSearchOrder = signal<{ column: string; direction: string } | null>(null);

  // Datagrid sort (persisted)
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<'ASC' | 'DESC'>('ASC');

  toggleSort(column: string) {
    const current = this.sortColumn();
    if (current === column) {
      if (this.sortDirection() === 'ASC') {
        this.sortDirection.set('DESC');
      } else {
        // Clear sort
        this.sortColumn.set(null);
        this.sortDirection.set('ASC');
      }
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('ASC');
    }

    // Persist
    const col = this.sortColumn();
    if (col) {
      this.message.set(StorageType.SortColumn, col);
      this.message.set(StorageType.SortDirection, this.sortDirection());
    } else {
      this.message.set(StorageType.SortColumn, null);
      this.message.set(StorageType.SortDirection, null);
    }

    this.currentPage.set(1);
    this.fetchCurrentPage();
  }

  private getSortOrder(): { column: string; direction: string } | null {
    const col = this.sortColumn();
    return col ? { column: col, direction: this.sortDirection() } : null;
  }

  selectSearch(where: { key: string; value: any }[], order?: { column: string; direction: string }) {
    this.parentId.set(null);
    this.collectionId.set(null);
    this.activeFilter.set(null);
    this.activeSearchWhere.set(where);
    this.activeSearchOrder.set(order ?? null);
    this.activeSmartCollectionId.set(null);
    this.currentPage.set(1);
    this.fetchCurrentPage();
  }

  clearSearch() {
    this.activeSearchWhere.set(null);
    this.activeSearchOrder.set(null);
    this.stores.set([]);
    this.storeCount.set(0);
  }

  storeUpdate(id: number, data: any): Promise<Store> {
    return this.track(this.message.storeUpdate(id, data));
  }

  syncSystemFonts(): Promise<SystemStats> {
    return this.track(
      this.message.syncSystemFonts().then((result) => {
        this.systemStats.set(result);
        return result;
      }),
    );
  }

  resetFavorites(): Promise<SystemStats> {
    return this.track(
      this.message.resetFavorites().then((result) => {
        this.systemStats.set(result);
        return result;
      }),
    );
  }

  fetchSystemStats(): Promise<SystemStats> {
    return this.track(
      this.message.fetchSystemStats().then((result) => {
        this.systemStats.set(result);
        return result;
      }),
    );
  }

  // Logger

  log(message: string, type: number): Promise<Logger[]> {
    return this.track(this.message.loggerCreate(message, type));
  }

  loggerFind(args: any): Promise<Logger[]> {
    return this.track(this.message.loggerFind(args));
  }

  loggerFindOne(args: any): Promise<Logger> {
    return this.track(this.message.loggerFindOne(args));
  }

  loggerFindOneBy(args: any): Promise<Logger> {
    return this.track(this.message.loggerFindOneBy(args));
  }

  loggerCreate(message: string, type: number): Promise<Logger[]> {
    return this.track(this.message.loggerCreate(message, type));
  }

  loggerDelete(id: number): Promise<Logger[]> {
    return this.track(this.message.loggerDelete(id));
  }

  loggerTruncate(): Promise<Logger[]> {
    return this.track(this.message.loggerTruncate());
  }
}
