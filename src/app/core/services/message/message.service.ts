import { Injectable } from '@angular/core';
import { ElectronService } from '@app/core/services/electron/electron.service';
import { Collection } from '@main/database/entity/Collection.schema';
import { Logger } from '@main/database/entity/Logger.schema';
import { Store } from '@main/database/entity/Store.schema';
import { ChannelType } from '@main/enums';
import { SystemStats } from '@main/types';

type StoreWithCountType = Array <number | Store[]>;

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private electron: ElectronService
  ) { }

  delay<T>(millis: number, value?: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), millis));
  }

  systemBoot() {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_SYSTEM_BOOT);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_SYSTEM_BOOT, (_event, response) => {
        resolve(response);
      });
    });

  }

  systemReset() {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_SYSTEM_BOOT);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_SYSTEM_BOOT, (_event, response) => {
        resolve(response);
      });
    });
  }

  /**
   * Config Manager
   */

  set(key: string, values: any) {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_SET_CONFIG, { key, values });
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_SET_CONFIG, (_event, response) => {
        resolve(response);
      });
    });
  }

  get(key: string, values: any) {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_GET_CONFIG, { key, values });
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_GET_CONFIG, (_event, response) => {
        resolve(response);
      });
    });
  }

  clearStore() {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_CLEAR_STORE);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_CLEAR_STORE, (_event, response) => {
        resolve(response);
      });
    });
  }

  /**
   * Connection Manager
   */

  saveDbConnection(options: any) {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_SAVE_DBCONNECTION, options);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, (_event, response) => {
        resolve(response);
      });
    });
  }

  deleteDbConnection(name: string) {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_DELETE_DBCONNECTION, name);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, (_event, response) => {
        resolve(response);
      });
    });
  }

  enableDbConnection(item: any) {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_ENABLE_DBCONNECTION, item);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_ENABLE_DBCONNECTION, (_event, response) => {
        resolve(response);
      });
    });
  }

  testDbConnection(item: any) {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_TEST_CONNECTION, item);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_TEST_CONNECTION, (_event, response) => {
        resolve(response);
      });
    });
  }

  dropDatabase() {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_DROP_DATABASE);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_DROP_DATABASE, (_event, response) => {
        resolve(response);
      });
    });
  }

  /**
   * Font Manager
   */

  exec(cmd: string, options: object = {}): Promise<any> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_EXECUTE_COMMAND, { cmd, options });
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_EXECUTE_COMMAND, (_event, response) => {
        resolve(response);
      });
    });
  }

  scanFiles(options: any, collectionId: number): Promise<any[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_FILES_SCAN, { ...options, collectionId });
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_FILES_SCAN, (_event, response) => {
        resolve(response);
      });
    });
  }

  scanFolders(options: any, collectionId: number): Promise<any[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_FOLDERS_SCAN, { ...options, collectionId });
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_FOLDERS_SCAN, (_event, response) => {
        resolve(response);
      });
    });
  }

  fontActivation(options: object = {}): Promise<Store[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_FONT_ACTIVATION, options);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_FONT_ACTIVATION, (_event, response) => {
        resolve(response);
      });
    });
  }

  systemAuthenticate(options: any) {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_AUTH_USER, options);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_AUTH_USER, (_event, response) => {
        resolve(response);
      });
    });
  }

  fetchLatestNews(options: any) {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_FETCH_NEWS, options);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_FETCH_NEWS, (_event, response) => {
        resolve(response);
      });
    });
  }

  fetchNewsContent(url: string) {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_NEWS_CONTENT, url);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_NEWS_CONTENT, (_event, response) => {
        resolve(response);
      });
    });
  }

  showMessageBox(options: any): Promise<any[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_MESSAGE_BOX, options);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_MESSAGE_BOX, (_event, response) => {
        resolve(response);
      });
    });
  }

  showOpenDialog(options: any): Promise<any[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_OPEN_DIALOG, options);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_OPEN_DIALOG, (_event, response) => {
        resolve(response);
      });
    });
  }

  openPath(path: string): void {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_OPEN_PATH, path);
  }

  showItemInFolder(path: string): void {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_OPEN_FOLDER, path);
  }

  openExternal(url: string): void {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_OPEN_EXTERNAL, url);
  }

  reloadWindow(): void {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_RELOAD_WINDOW);
  }

  quitApplication(): void {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_QUIT);
  }

  exitApplication(): void {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_EXIT);
  }

  beep(): void {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_BEEP);
  }

  /**
   * Collection
   */

  fetchCollections(): Promise<Collection[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_FETCH_COLLECTIONS);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_FETCH_COLLECTIONS, (_event, response) => {
        resolve(response);
      });
    });
  }

  createCollection(parentId: number): Promise<Collection[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_CREATE_COLLECTION, parentId);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_CREATE_COLLECTION, (_event, response) => {
        resolve(response);
      });
    });
  }

  deleteCollection(id: number): Promise<Collection[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_DELETE_COLLECTION, id);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_DELETE_COLLECTION, (_event, response) => {
        resolve(response);
      });
    });
  }

  updateCollection(id: number, data: any): Promise<Collection[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_UPDATE_COLLECTION, { id, ...data });
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_UPDATE_COLLECTION, (_event, response) => {
        resolve(response);
      });
    });
  }

  resetEnabledCollection(): Promise<Collection[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_RESET_ENABLED);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_RESET_ENABLED, (_event, response) => {
        resolve(response);
      });
    });
  }

  /**
   * Store
   */

  fetchStore(data: any): Promise<StoreWithCountType> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_STORE_FETCH_ALL, data);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_STORE_FETCH_ALL, (_event, response: StoreWithCountType) => {
        resolve(response);
      });
    });
  }

  fetchStoreRow(id: number): Promise<Store> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_STORE_FETCH_ROW, id);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_STORE_FETCH_ROW, (_event, response: Store) => {
        resolve(response);
      });
    });
  }

  updateStore(id: number, data: any): Promise<Store> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_STORE_UPDATE, { id, data });
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_STORE_UPDATE, (_event, response: Store) => {
        resolve(response);
      });
    });
  }

  updateCollectionCount(id: number): Promise<any[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_UPDATE_COUNT, id);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_UPDATE_COUNT, (_event, response) => {
        resolve(response);
      });
    });
  }

  updateCollectionCounts(): Promise<any[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_UPDATE_COUNTS);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_UPDATE_COUNTS, (_event, response) => {
        resolve(response);
      });
    });
  }

  syncSystemFonts(): Promise<any[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_SYNC_SYSTEM);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_SYNC_SYSTEM, (_event, response) => {
        resolve(response);
      });
    });
  }

  syncActivatedFonts(): Promise<any[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_SYNC_ACTIVATED);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_SYNC_ACTIVATED, (_event, response) => {
        resolve(response);
      });
    });
  }

  resetFavorites(): Promise<any[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_RESET_FAVORITES);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_RESET_FAVORITES, (_event, response) => {
        resolve(response);
      });
    });
  }

  fetchSystemStats(): Promise<SystemStats> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_SYSTEM_STATS);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_SYSTEM_STATS, (_event, response) => {
        resolve(response);
      });
    });
  }

  /**
   * Logger
   */

  log(message: string, type: number): Promise<Logger[]> {
      this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_LOGGER_CREATE, { message, type });
      return new Promise((resolve, _reject) => {
        this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_LOGGER_CREATE, (_event, response) => {
          resolve(response);
        });
      });
  }

  fetchLogs(): Promise<Logger[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_LOGGER_QUERY);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_LOGGER_QUERY, (_event, response) => {
        resolve(response);
      });
    });
  }

  deleteLog(options: any): Promise<Logger[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_LOGGER_DELETE_ITEM, options);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_LOGGER_DELETE_ITEM, (_event, response) => {
        resolve(response);
      });
    });
  }

  truncateLogs(): Promise<Logger[]> {
    this.electron.ipcRenderer.send(ChannelType.IPCMAIN_REQUEST_LOGGER_TRUNCATE);
    return new Promise((resolve, _reject) => {
      this.electron.ipcRenderer.on(ChannelType.IPCMAIN_RESPONSE_LOGGER_TRUNCATE, (_event, response) => {
        resolve(response);
      });
    });
  }
}
