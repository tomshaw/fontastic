import { Injectable } from '@angular/core';
import { ElectronService } from '@app/core/services/electron/electron.service';
import * as channel from '@main/config/channel';

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
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_SYSTEM_BOOT);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_SYSTEM_BOOT, (event, response) => {
        resolve(response);
      });
    });

  }

  systemReset() {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_SYSTEM_BOOT);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_SYSTEM_BOOT, (event, response) => {
        resolve(response);
      });
    });
  }

  /**
   * Config Manager
   */

  set(key: string, values: any) {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_SET_CONFIG, { key, values });
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_SET_CONFIG, (event, response) => {
        resolve(response);
      });
    });
  }

  get(key: string, values: any) {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_GET_CONFIG, { key, values });
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_GET_CONFIG, (event, response) => {
        resolve(response);
      });
    });
  }

  clearStore() {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_CLEAR_STORE);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_CLEAR_STORE, (event, response) => {
        resolve(response);
      });
    });
  }

  /**
   * Connection Manager
   */

  saveDbConnection(options: any) {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_SAVE_DBCONNECTION, options);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, (event, response) => {
        resolve(response);
      });
    });
  }

  deleteDbConnection(name: string) {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_DELETE_DBCONNECTION, name);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, (event, response) => {
        resolve(response);
      });
    });
  }

  enableDbConnection(item: any) {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_ENABLE_DBCONNECTION, item);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_ENABLE_DBCONNECTION, (event, response) => {
        resolve(response);
      });
    });
  }

  testDbConnection(item: any) {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_TEST_CONNECTION, item);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, (event, response) => {
        resolve(response);
      });
    });
  }

  dropDatabase() {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_DROP_DATABASE);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_DROP_DATABASE, (event, response) => {
        resolve(response);
      });
    });
  }

  /**
   * Font Manager
   */

  exec(cmd: string, options: object = {}): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_EXECUTE_COMMAND, { cmd, options });
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_EXECUTE_COMMAND, (event, response) => {
        resolve(response);
      });
    });
  }

  scanFiles(options: any, collectionId: number): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_FILES_SCAN, { ...options, collectionId });
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_FILES_SCAN, (event, response) => {
        resolve(response);
      });
    });
  }

  scanFolders(options: any, collectionId: number): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_FOLDERS_SCAN, { ...options, collectionId });
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_FOLDERS_SCAN, (event, response) => {
        resolve(response);
      });
    });
  }

  fontActivation(options: object = {}): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_FONT_ACTIVATION, options);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, (event, response) => {
        resolve(response);
      });
    });
  }

  systemAuthenticate(options: any) {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_AUTH_USER, options);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_AUTH_USER, (event, response) => {
        resolve(response);
      });
    });
  }

  fetchLatestNews(options: any) {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_FETCH_NEWS, options);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_FETCH_NEWS, (event, response) => {
        resolve(response);
      });
    });
  }

  fetchNewsContent(url: string) {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_NEWS_CONTENT, url);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_NEWS_CONTENT, (event, response) => {
        resolve(response);
      });
    });
  }

  showMessageBox(options: any): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_MESSAGE_BOX, options);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_MESSAGE_BOX, (event, response) => {
        resolve(response);
      });
    });
  }

  showOpenDialog(options: any): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_OPEN_DIALOG, options);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_OPEN_DIALOG, (event, response) => {
        resolve(response);
      });
    });
  }

  openPath(path: string): void {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_OPEN_PATH, path);
  }

  showItemInFolder(path: string): void {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_OPEN_FOLDER, path);
  }

  openExternal(url: string): void {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_OPEN_EXTERNAL, url);
  }

  reloadWindow(): void {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_RELOAD_WINDOW);
  }

  quitApplication(): void {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_QUIT);
  }

  exitApplication(): void {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_EXIT);
  }

  beep(): void {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_BEEP);
  }

  /**
   * Collection
   */

  fetchCollections(): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_FETCH_COLLECTIONS);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_FETCH_COLLECTIONS, (event, response) => {
        resolve(response);
      });
    });
  }

  createCollection(parentId: number): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_CREATE_COLLECTION, parentId);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_CREATE_COLLECTION, (event, response) => {
        resolve(response);
      });
    });
  }

  deleteCollection(id: number): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_DELETE_COLLECTION, id);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_DELETE_COLLECTION, (event, response) => {
        resolve(response);
      });
    });
  }

  updateCollection(id: number, data: any): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_UPDATE_COLLECTION, { id, ...data });
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_UPDATE_COLLECTION, (event, response) => {
        resolve(response);
      });
    });
  }

  resetEnabledCollection(): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_RESET_ENABLED);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_RESET_ENABLED, (event, response) => {
        resolve(response);
      });
    });
  }

  /**
   * Store
   */

  fetchStore(data: any): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_STORE_FETCH_ALL, data);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_STORE_FETCH_ALL, (event, response) => {
        resolve(response);
      });
    });
  }

  fetchStoreRow(id: number): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_STORE_FETCH_ROW, id);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_STORE_FETCH_ROW, (event, response) => {
        resolve(response);
      });
    });
  }

  updateStore(id: number, data: any): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_STORE_UPDATE, { id, data });
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_STORE_UPDATE, (event, response) => {
        resolve(response);
      });
    });
  }

  updateCollectionCount(id: number): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_UPDATE_COUNT, id);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_UPDATE_COUNT, (event, response) => {
        resolve(response);
      });
    });
  }

  updateCollectionCounts(): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_UPDATE_COUNTS);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_UPDATE_COUNTS, (event, response) => {
        resolve(response);
      });
    });
  }

  syncSystemFonts(): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_SYNC_SYSTEM);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_SYNC_SYSTEM, (event, response) => {
        resolve(response);
      });
    });
  }

  syncActivatedFonts(): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_SYNC_ACTIVATED);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_SYNC_ACTIVATED, (event, response) => {
        resolve(response);
      });
    });
  }

  resetFavorites(): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_RESET_FAVORITES);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_RESET_FAVORITES, (event, response) => {
        resolve(response);
      });
    });
  }

  fetchSystemStats(): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_SYSTEM_STATS);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_SYSTEM_STATS, (event, response) => {
        resolve(response);
      });
    });
  }

  /**
   * Logger
   */

  log(message: string, type: number): Promise<any[]> {
      this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_LOGGER_CREATE, { message, type });
      return new Promise((resolve, reject) => {
        this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_LOGGER_CREATE, (event, response) => {
          resolve(response);
        });
      });
  }

  fetchLogs(options: any = {}): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_LOGGER_QUERY, options);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_LOGGER_QUERY, (event, response) => {
        resolve(response);
      });
    });
  }

  deleteLog(options: any): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_LOGGER_DELETE_ITEM, options);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_LOGGER_DELETE_ITEM, (event, response) => {
        resolve(response);
      });
    });
  }

  truncateLogs(): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_LOGGER_TRUNCATE);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_LOGGER_TRUNCATE, (event, response) => {
        resolve(response);
      });
    });
  }
}
