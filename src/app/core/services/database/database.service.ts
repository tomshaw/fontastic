import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FontService } from '@app/core/services/font/font.service';
import { MessageService } from '@app/core/services/message/message.service';
import { PresentationService } from '@app/core/services/presentation/presentation.service';
import { ElectronService } from '@app/core/services/electron/electron.service';
import { Store } from '@main/database/entity/Store.schema';
import { Collection } from '@main/database/entity/Collection.schema';
import { QueryOptions, SystemStats } from '@main/types';
import { StorageType } from '@main/enums';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  _activePage = new BehaviorSubject<number>(1);
  watchActivePage$ = this._activePage.asObservable();

  // STORE
  _storeId = new BehaviorSubject<number>(0);
  watchStoreId$ = this._storeId.asObservable();

  _storeResult = new BehaviorSubject<Store>(null);
  watchStoreResult$ = this._storeResult.asObservable();

  _storeResultSet = new BehaviorSubject<Store[]>([]);
  watchStoreResultSet$ = this._storeResultSet.asObservable();

  // COLLECTION 
  _collectionId = new BehaviorSubject<number>(0);
  watchCollectionId$ = this._collectionId.asObservable();

  _collectionResult = new BehaviorSubject<Collection>(null);
  watchCollectionResult$ = this._collectionResult.asObservable();

  _collectionResultSet = new BehaviorSubject<Collection[]>([]);
  watchCollectionResultSet$ = this._collectionResultSet.asObservable();

  // COUNTS 
  _resultSetCount = new BehaviorSubject<number>(0);
  watchResultSetCount$ = this._resultSetCount.asObservable();

  _resultSetTotal = new BehaviorSubject<number>(0);
  watchResultSetTotal$ = this._resultSetTotal.asObservable();

  _queryOptions = new BehaviorSubject<QueryOptions>({
    order: {
      column: 'id',
      direction: 'ASC',
    },
    where: [],
    skip: 0,
    take: 100,
    run: false
  });
  watchQueryOptions$ = this._queryOptions.asObservable();

  order = { column: 'file_name', direction: 'ASC' };
  where = [];
  skip = 0;
  take = 100;

  search = false;
  stats = false;

  _systemStats = new BehaviorSubject<SystemStats>({
    rowCount: 0,
    favoriteCount: 0,
    systemCount: 0,
    activatedCount: 0,
    temporaryCount: 0
  });
  watchSystemStats$ = this._systemStats.asObservable();

  constructor(
    public fontService: FontService,
    public messageService: MessageService,
    public presentationService: PresentationService,
    public electronService: ElectronService
  ) {

    if (electronService.isElectron) {

      if (this.electronService.store.has(StorageType.CollectionId)) {
        const id = this.electronService.store.get(StorageType.CollectionId);
        if (id) {
          this.setCollectionId(id);
        }
      }

      if (this.electronService.store.has(StorageType.StoreId)) {
        const id = this.electronService.store.get(StorageType.StoreId);
        if (id) {
          this.setStoreId(id);
        }
      }

      this.watchQueryOptions$.subscribe((options: QueryOptions) => {
        if (options.run) {
          this.execute(options);
        }
      });

      this.watchStoreId$.subscribe((id: number) => {
        if (Number.isInteger(id)) {
          messageService.storeFindOne({ where: { id } }).then((result: Store) => {
            if (result) {
              this.setStoreResult(result);
              const resource = this.fontService.withTransferProtocol(result.file_path, 'file');
              this.fontService.load(resource).then((font: opentype.Font) => this.fontService.setFontObject(font));
            }
          });
        }
      });

      // System boot
      this.fetchCollections();

      this.fetchSystemStats();
    }
  }

  fetchCollections() {
    this.messageService.collectionFetch({}).then((result: Collection[]) => this.setCollectionResultSet(result));
  }

  getResultSetCount(): number {
    return this._resultSetCount.getValue();
  }

  getResultSetTotal(): number {
    return this._resultSetTotal.getValue();
  }

  /**
   * BEGIN STORE 
   */

  setStoreId(id: number): void {
    this._storeId.next(id);
    this.electronService.store.set(StorageType.StoreId, id);
  }

  getStoreId(): number {
    return this._storeId.getValue();
  }

  setStoreResult(result: Store) {
    this._storeResult.next(result);
  }

  getStoreResult(): Store {
    return this._storeResult.getValue();
  }

  setStoreResultSet(results: Store[]): void {
    this._storeResultSet.next(results);
  }

  getStoreResultSet(): Store[] {
    return this._storeResultSet.getValue();
  }

  /**
   * BEGIN SYSTEM STATS  
   */

  setSystemStats(results: SystemStats): void {
    this._systemStats.next(results);
  }

  getSystemStats(): SystemStats {
    return this._systemStats.getValue();
  }

  fetchSystemStats(): void {
    this.messageService.fetchSystemStats().then((result: SystemStats) => this.setSystemStats(result));
  }

  /**
   * BEGIN COLLECTION 
   */

  setCollectionId(id: number): void {
    this._collectionId.next(id);
    this.electronService.store.set(StorageType.CollectionId, id);
  }

  getCollectionId(): number {
    return this._collectionId.getValue();
  }

  setCollectionResult(result: Collection) {
    this._collectionResult.next(result);
  }

  getCollectionResult(): Collection {
    return this._collectionResult.getValue();
  }

  setCollectionResultSet(results: Collection[]) {
    this._collectionResultSet.next(results);
  }

  getCollectionResultSet(): Collection[] {
    return this._collectionResultSet.getValue();
  }

  /**
   * BEGIN QUERY OPTIONS
   */

  setQueryOptions(options: any): DatabaseService {
    this._queryOptions.next(options);
    return this;
  }

  getQueryOptions(): QueryOptions {
    return this._queryOptions.getValue();
  }

  setOrder(column: string, direction: string): DatabaseService {
    this.order = { column, direction };
    return this;
  }

  setWhere(key: string, value: any): DatabaseService {
    this.where.push({ key, value });
    return this;
  }

  setSkip(skip: number): DatabaseService {
    this.skip = skip;
    return this;
  }

  setTake(take: number): DatabaseService {
    this.take = take;
    return this;
  }

  setSearch(search: boolean): DatabaseService {
    this.search = search;
    return this;
  }

  run(): void {
    this.setQueryOptions({
      order: this.order,
      where: this.where,
      skip: this.skip,
      take: this.take,
      run: true
    }).resetWhere();
  }

  resetWhere(): DatabaseService {
    this.where = [];
    return this;
  }

  resetPage(page: number): DatabaseService {
    this._activePage.next(page);
    return this;
  }

  async execute(options: QueryOptions) {
    const t0 = performance.now();
    const [results, total]: any = (this.search) ? await this.fetchSearch(options) : await this.fetchStore(options);
    const t1 = performance.now();
    this._resultSetCount.next(results.length);
    this._resultSetTotal.next(total);
    this._storeResultSet.next(results);
    this.presentationService.setSystemLoading(false);
    console.warn(t1 - t0, 'milliseconds');
  }

  async fetchStore(options: QueryOptions) {
    return await this.messageService.storeFetch((this.getCollectionId() && this.stats === false) ? { ...options, collectionId: this.getCollectionId() } : options);
  }

  async fetchSearch(options: QueryOptions) {
    return await this.messageService.storeSearch(options);
  }
}
