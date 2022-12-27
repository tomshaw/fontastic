import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ConfigService } from '@app/core/services/config/config.service';
import { FontService } from '@app/core/services/font/font.service';
import { MessageService } from '@app/core/services/message/message.service';
import { PresentationService } from '@app/core/services/presentation/presentation.service';
import { ElectronService } from '@app/core/services/electron/electron.service';

import { QueryOptions, SystemStats } from '@app/core/interface';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  public _activePage = new BehaviorSubject<number>(1);
  watchActivePage$ = this._activePage.asObservable();

  public _resultSet = new BehaviorSubject<any[]>([]);
  watchResultSet$ = this._resultSet.asObservable();

  public _resultSetCount = new BehaviorSubject<number>(0);
  watchResultSetCount$ = this._resultSetCount.asObservable();

  public _resultSetTotal = new BehaviorSubject<number>(0);
  watchResultSetTotal$ = this._resultSetTotal.asObservable();

  // Watch collection changes.
  public _collection = new BehaviorSubject<any[]>([]);
  watchCollection$ = this._collection.asObservable();

  // Watch selected collection id.  
  public _collectionId = new BehaviorSubject<number>(0);
  watchCollectionId$ = this._collectionId.asObservable();

  // Watch selected store id.
  public _storeId = new BehaviorSubject<number>(0);
  watchStoreId$ = this._storeId.asObservable();

  // Watch selected store row.
  public _storeRow = new BehaviorSubject<any>({});
  watchStoreRow$ = this._storeRow.asObservable();

  public _queryOptions = new BehaviorSubject<QueryOptions>({
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

  public _systemStats = new BehaviorSubject<SystemStats>({
    rowCount: 0,
    favoriteCount: 0,
    systemCount: 0,
    activatedCount: 0,
    temporaryCount: 0
  });
  watchSystemStats$ = this._systemStats.asObservable();

  constructor(
    public configService: ConfigService,
    public fontService: FontService,
    public messageService: MessageService,
    public presentationService: PresentationService,
    public electronService: ElectronService
  ) {

    if (electronService.isElectron) {

      // Load saved collection row id.
      if (this.electronService.store.has('COLLECTION_ID')) {
        const id = this.electronService.store.get('COLLECTION_ID');
        if (id) {
          this.setCollectionId(id);
        }
      }

      // Load saved store row id.
      if (this.electronService.store.has('STORE_ID')) {
        const id = this.electronService.store.get('STORE_ID');
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
          messageService.fetchStoreRow(id).then(async (result: any) => {
            if (result) {
              this.fontService.load(result.file_path).then((data) => {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                this.setStoreRow({ ...result, font_meta: data });
              });
            }
          });
        }
      });

      // Boot system.
      messageService.fetchCollections().then(result => this.setCollection(result));

      this.fetchSystemStats();
    }
  }

  getResultSetCount() {
    return this._resultSetCount.getValue();
  }

  getResultSetTotal() {
    return this._resultSetTotal.getValue();
  }

  /**
   * BEGIN STORE 
   */

  setStoreId(id: number): void {
    this._storeId.next(id);
    this.electronService.store.set('STORE_ID', id);
  }

  getStoreId(): number {
    return this._storeId.getValue();
  }

  setStoreRow(items: any) {
    this._storeRow.next(items);
  }

  getStoreRow(): any {
    return this._storeRow.getValue();
  }

  setStoreResultSet(data: any[]): void {
    this._resultSet.next(data);
  }

  getStoreResultSet(): any {
    return this._resultSet.getValue();
  }

  /**
   * BEGIN SYSTEM STATS  
   */

  setSystemStats(results: any) {
    this._systemStats.next(results);
  }

  getSystemStats() {
    return this._systemStats.getValue();
  }

  fetchSystemStats() {
    this.messageService.fetchSystemStats().then((result: any) => {
      this.setSystemStats(result);
    }).catch((err) => { });
  }

  /**
   * BEGIN COLLECTION 
   */

  setCollectionId(id: number) {
    this._collectionId.next(id);
    this.electronService.store.set('COLLECTION_ID', id);
  }

  getCollectionId(): number {
    return this._collectionId.getValue();
  }

  setCollection(items: any[]) {
    this._collection.next(items);
  }

  getCollection(): object {
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
    const [total, results] = await this.messageService.fetchStore(options);
    const t1 = performance.now();
    this._resultSetCount.next(results.length);
    this._resultSetTotal.next(total);
    this._resultSet.next(results);
    this.presentationService.setSystemLoading(false);
    console.warn(t1 - t0, 'milliseconds');
  }
}
