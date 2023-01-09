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

  _resultSet = new BehaviorSubject<Store[]>([]);
  watchResultSet$ = this._resultSet.asObservable();

  _resultSetCount = new BehaviorSubject<number>(0);
  watchResultSetCount$ = this._resultSetCount.asObservable();

  _resultSetTotal = new BehaviorSubject<number>(0);
  watchResultSetTotal$ = this._resultSetTotal.asObservable();

  _collection = new BehaviorSubject<Collection[]>([]);
  watchCollection$ = this._collection.asObservable();
  
  _collectionId = new BehaviorSubject<number>(0);
  watchCollectionId$ = this._collectionId.asObservable();

  _storeId = new BehaviorSubject<number>(0);
  watchStoreId$ = this._storeId.asObservable();

  _storeRow = new BehaviorSubject<Store>(null);
  watchStoreRow$ = this._storeRow.asObservable();

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

      this.watchQueryOptions$.subscribe((options: any) => {
        if (options.run) {
          options.search = this.search;
          this.execute(options);
        }
      });

      this.watchStoreId$.subscribe((id: number) => {
        if (Number.isInteger(id)) {
          messageService.fetchStoreRow(id).then((result: Store) => {
            if (result) {
              this.setStoreRow(result);
              const resource = this.fontService.withTransferProtocol(result.file_path, 'file');
              this.fontService.load(resource).then((font: opentype.Font) => this.fontService.setFontObject(font));
            }
          });
        }
      });

      // System boot
      messageService.fetchCollections().then((result: Collection[]) => this.setCollection(result));

      this.fetchSystemStats();
    }
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

  setStoreRow(items: Store) {
    this._storeRow.next(items);
  }

  getStoreRow(): Store {
    return this._storeRow.getValue();
  }

  setStoreResultSet(data: Store[]): void {
    this._resultSet.next(data);
  }

  getStoreResultSet(): Store[] {
    return this._resultSet.getValue();
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

  setCollection(items: Collection[]) {
    this._collection.next(items);
  }

  getCollection(): Collection[] {
    return this._collection.getValue();
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
    const [total, results]: any = await this.messageService.fetchStore(options);
    const t1 = performance.now();
    this._resultSetCount.next(results.length);
    this._resultSetTotal.next(total);
    this._resultSet.next(results);
    this.presentationService.setSystemLoading(false);
    console.warn(t1 - t0, 'milliseconds');
  }
}
