import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ElectronService } from '@app/core/services/electron/electron.service';
import * as channel from '@main/config/channel';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private electron: ElectronService
  ) {
    if (electron.isElectron) {
      electron.ipcRenderer.setMaxListeners(50);
    }
  }

  delay<T>(millis: number, value?: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), millis))
  }

  systemBoot() {
    return of(this.electron.ipcRenderer.sendSync(channel.IPCMAIN_SYSTEM_BOOT))
      .pipe(catchError((error: any) => throwError(() => new Error(error))));
  }

  systemReset() {
    return of(this.electron.ipcRenderer.sendSync(channel.IPCMAIN_SYSTEM_RESET))
      .pipe(catchError((error: any) => throwError(() => new Error(error))));
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
    return of(this.electron.ipcRenderer.sendSync(channel.IPCMAIN_REQUEST_ENABLE_DBCONNECTION, item))
      .pipe(catchError((error: any) => throwError(() => new Error(error))));
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

  truncateDatabase() {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_TRUNCATE_DATABASE);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_TRUNCATE_DATABASE, (event, response) => {
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

  scanFiles(paths: string[], collectionId: number): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_FILES_SCAN, { paths, collectionId });
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_FILES_SCAN, (event, response) => {
        this.delay(1e3, resolve(response));
      });
    });
  }

  scanFolders(paths: string[], collectionId: number): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_FOLDERS_SCAN, { paths, collectionId });
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
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_SYSTEM_AUTH, options);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_SYSTEM_AUTH, (event, response) => {
        resolve(response);
      });
    });
  }

  showMessageBox(options: any): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_SHOW_MESSAGE_BOX, options);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_SHOW_MESSAGE_BOX, (event, response) => {
        resolve(response);
      });
    });
  }

  showOpenDialog(options: any): Promise<any[]> {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_SHOW_OPEN_DIALOG, options);
    return new Promise((resolve, reject) => {
      this.electron.ipcRenderer.on(channel.IPCMAIN_RESPONSE_SHOW_OPEN_DIALOG, (event, response) => {
        resolve(response);
      });
    });
  }

  openPath(path: string): void {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_OPEN_PATH, path);
  }

  showItemInFolder(path: string): void {
    this.electron.ipcRenderer.send(channel.IPCMAIN_REQUEST_SHOW_ITEM_FOLDER, path);
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

  fetchCollections(): Observable<any[]> {
    return of(this.electron.ipcRenderer.sendSync(channel.IPCMAIN_REQUEST_FETCH_COLLECTIONS))
      .pipe(catchError((error: any) => throwError(() => new Error(error))));
  }

  createCollection(parentId: number): Observable<any> {
    return of(this.electron.ipcRenderer.sendSync(channel.IPCMAIN_REQUEST_CREATE_COLLECTION, parentId))
      .pipe(catchError((error: any) => throwError(() => new Error(error))));
  }

  deleteCollection(id: number): Observable<any[]> {
    return of(this.electron.ipcRenderer.sendSync(channel.IPCMAIN_REQUEST_DELETE_COLLECTION, id))
      .pipe(catchError((error: any) => throwError(() => new Error(error))));
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

  updateCollectionCount(id: number): Observable<any[]> {
    return of(this.electron.ipcRenderer.sendSync(channel.IPCMAIN_REQUEST_UPDATE_COUNT, id))
      .pipe(catchError((error: any) => throwError(() => new Error(error))));
  }

  updateCollectionCounts(): Observable<any[]> {
    return of(this.electron.ipcRenderer.sendSync(channel.IPCMAIN_REQUEST_UPDATE_COUNTS))
      .pipe(catchError((error: any) => throwError(() => new Error(error))));
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

  log(message: string, type: number): Observable<any> {
    return of(this.electron.ipcRenderer.sendSync(channel.IPCMAIN_REQUEST_LOGGER_CREATE, { message, type }))
      .pipe(catchError((error: any) => throwError(() => new Error(error))));
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
