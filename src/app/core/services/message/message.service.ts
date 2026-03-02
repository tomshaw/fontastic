import { Injectable } from '@angular/core';
import { ElectronService } from '@app/core/services/electron/electron.service';
import { Collection } from '@main/database/entity/Collection.schema';
import { Logger } from '@main/database/entity/Logger.schema';
import { Store, StoreManyAndCountType } from '@main/database/entity/Store.schema';
import { ChannelType } from '@main/enums';
import { SystemConfig, SystemStats } from '@main/types';
import { IpcMainEvent } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private electron: ElectronService
  ) { }

  on(channel: string, listener: any): Electron.IpcRenderer {
    if (this.electron.isElectron) {
      return this.electron.ipcRenderer.on(channel, listener);
    }
  }

  once(channel: string, listener: any): Electron.IpcRenderer {
    if (this.electron.isElectron) {
      return this.electron.ipcRenderer.once(channel, listener);
    }
  }

  send(channel: string, args?: any): void {
    if (this.electron.isElectron) {
      this.electron.ipcRenderer.send(channel, args);
    }
  }

  invoke(channel: string, args?: any): Promise<any> {
    if (this.electron.isElectron) {
      return this.electron.ipcRenderer.invoke(channel, args);
    }
  }

  removeListener(channel: string, listener: any): Electron.IpcRenderer {
    if (this.electron.isElectron) {
      return this.electron.ipcRenderer.removeListener(channel, listener);
    }
  }

  removeAllListeners(channel: string): Electron.IpcRenderer {
    if (this.electron.isElectron) {
      return this.electron.ipcRenderer.removeAllListeners(channel);
    }
  }

  systemBoot(): Promise<SystemConfig> {
    this.send(ChannelType.IPC_REQUEST_SYSTEM_BOOT);
    return new Promise((resolve, _reject) => {
      this.once(ChannelType.IPC_RESPONSE_SYSTEM_BOOT, (_event: IpcMainEvent, response: any) => {
        resolve(response);
      });
    });
  }

  systemReboot(): void {
    this.send(ChannelType.IPC_SYSTEM_REBOOT);
  }

  // Config Manager

  set(key: string, values: any): Promise<any> {
    return this.invoke(ChannelType.IPC_SET_CONFIG, { key, values });
  }

  get(key: string, values: any): Promise<any> {
    return this.invoke(ChannelType.IPC_GET_CONFIG, { key, values });
  }

  clearStore(): Promise<any> {
    return this.invoke(ChannelType.IPC_ZAP_CONFIG);
  }

  // Connection Manager

  createDbConnection(args: any): Promise<any> {
    return this.invoke(ChannelType.IPC_DBCONNECTION_CREATE, args);
  }

  enableDbConnection(args: any): Promise<any> {
    return this.invoke(ChannelType.IPC_DBCONNECTION_ENABLE, args);
  }

  deleteDbConnection(name: string): Promise<any> {
    return this.invoke(ChannelType.IPC_DBCONNECTION_DELETE, name);
  }

  testDbConnection(item: any): Promise<any> {
    return this.invoke(ChannelType.IPC_DBCONNECTION_TEST, item);
  }

  dropDatabase(): Promise<any> {
    return this.invoke(ChannelType.IPC_DATABASE_DROP);
  }

  // Font Manager

  exec(args: any): Promise<any> {
    return this.invoke(ChannelType.IPC_EXEC_CMD, args);
  }

  systemAuthenticate(args: any): Promise<any> {
    return this.invoke(ChannelType.IPC_AUTH_USER, args);
  }

  scanFiles(args: any): Promise<any> {
    return this.invoke(ChannelType.IPC_SCAN_FILES, args);
  }

  scanFolders(args: any): Promise<any> {
    return this.invoke(ChannelType.IPC_SCAN_FOLDERS, args);
  }

  fontActivation(args: any): Promise<Store[]> {
    return this.invoke(ChannelType.IPC_ACTIVATE_FONT, args);
  }

  folderActivation(args: any): Promise<Store[]> {
    return this.invoke(ChannelType.IPC_ACTIVATE_FOLDER, args);
  }

  fetchLatestNews(args: any): Promise<any> {
    return this.invoke(ChannelType.IPC_FETCH_NEWS, args);
  }

  showMessageBox(args: any): Promise<any> {
    return this.invoke(ChannelType.IPC_SHOW_MESSAGE_BOX, args);
  }

  showOpenDialog(args: any): Promise<any> {
    return this.invoke(ChannelType.IPC_SHOW_OPEN_DIALOG, args);
  }

  openPath(path: string): Promise<any> {
    return this.invoke(ChannelType.IPC_OPEN_PATH, path);
  }

  showItemInFolder(path: string): Promise<any> {
    return this.invoke(ChannelType.IPC_OPEN_FOLDER, path);
  }

  openExternal(url: string): Promise<any> {
    return this.invoke(ChannelType.IPC_OPEN_EXTERNAL, url);
  }

  reloadWindow(): void {
    this.send(ChannelType.IPC_RELOAD_WINDOW);
  }

  quitApplication(): void {
    this.send(ChannelType.IPC_QUIT);
  }

  exitApplication(): void {
    this.send(ChannelType.IPC_EXIT);
  }

  beep(): void {
    this.send(ChannelType.IPC_BEEP);
  }

  // Collection

  collectionFind(args: any): Promise<Collection[]> {
    return this.invoke(ChannelType.IPC_COLLECTION_FIND, args);
  }

  collectionFindOne(args: any): Promise<Collection> {
    return this.invoke(ChannelType.IPC_COLLECTION_FIND_ONE, args);
  }

  collectionFindOneBy(args: any): Promise<Collection> {
    return this.invoke(ChannelType.IPC_COLLECTION_FIND_ONE_BY, args);
  }

  collectionFetch(args: any): Promise<Collection[]> {
    return this.invoke(ChannelType.IPC_COLLECTION_FETCH, args);
  }

  collectionCreate(args: any): Promise<Collection[]> {
    return this.invoke(ChannelType.IPC_COLLECTION_CREATE, args);
  }

  collectionUpdate(collectionId: number, data: any): Promise<Collection[]> {
    return this.invoke(ChannelType.IPC_COLLECTION_UPDATE, { collectionId, data });
  }

  collectionUpdateIds(ids: any[], data: any): Promise<Collection[]> {
    return this.invoke(ChannelType.IPC_COLLECTION_UPDATE_IDS, { ids, data });
  }

  collectionDelete(collectionId: number): Promise<Collection[]> {
    return this.invoke(ChannelType.IPC_COLLECTION_DELETE, { collectionId });
  }

  collectionEnable(collectionId: number, data: any): Promise<Collection[]> {
    return this.invoke(ChannelType.IPC_COLLECTION_ENABLE, { collectionId, data });
  }

  collectionUpdateCount(id: number): Promise<Collection[]> {
    return this.invoke(ChannelType.IPC_COLLECTION_UPDATE_COUNT, id);
  }

  collectionUpdateCounts(): Promise<Collection[]> {
    return this.invoke(ChannelType.IPC_COLLECTION_UPDATE_COUNTS);
  }

  // Store

  storeFind(args: any): Promise<Store[]> {
    return this.invoke(ChannelType.IPC_STORE_FIND, args);
  }

  storeFindOne(args: any): Promise<Store> {
    return this.invoke(ChannelType.IPC_STORE_FIND_ONE, args);
  }

  storeFindOneBy(args: any): Promise<Store> {
    return this.invoke(ChannelType.IPC_STORE_FIND_ONE_BY, args);
  }

  storeFetch(options: any): Promise<StoreManyAndCountType> {
    return this.invoke(ChannelType.IPC_STORE_FETCH, options);
  }

  storeSearch(options: any): Promise<StoreManyAndCountType> {
    return this.invoke(ChannelType.IPC_STORE_SEARCH, options);
  }

  storeUpdate(id: number, data: any): Promise<Store> {
    return this.invoke(ChannelType.IPC_STORE_UPDATE, { id, data });
  }

  syncSystemFonts(): Promise<SystemStats> {
    return this.invoke(ChannelType.IPC_STORE_SYNC_SYSTEM);
  }

  syncActivatedFonts(): Promise<SystemStats> {
    return this.invoke(ChannelType.IPC_STORE_SYNC_ACTIVATED);
  }

  resetFavorites(): Promise<SystemStats> {
    return this.invoke(ChannelType.IPC_STORE_RESET_FAVORITES);
  }

  fetchSystemStats(): Promise<SystemStats> {
    return this.invoke(ChannelType.IPC_STORE_SYSTEM_STATS);
  }

  /**
   * Logger
   */

  log(message: string, type: number): Promise<Logger[]> {
    return this.loggerCreate(message, type);
  }

  loggerFind(args: any): Promise<Logger[]> {
    return this.invoke(ChannelType.IPC_LOGGER_FIND, args);
  }

  loggerFindOne(args: any): Promise<Logger> {
    return this.invoke(ChannelType.IPC_LOGGER_FIND_ONE, args);
  }

  loggerFindOneBy(args: any): Promise<Logger> {
    return this.invoke(ChannelType.IPC_LOGGER_FIND_ONE_BY, args);
  }

  loggerCreate(message: string, type: number): Promise<Logger[]> {
    return this.invoke(ChannelType.IPC_LOGGER_CREATE, { message, type });
  }

  loggerDelete(id: number): Promise<Logger[]> {
    return this.invoke(ChannelType.IPC_LOGGER_DELETE, { id });
  }

  loggerTruncate(): Promise<Logger[]> {
    return this.invoke(ChannelType.IPC_LOGGER_TRUNCATE);
  }
}
