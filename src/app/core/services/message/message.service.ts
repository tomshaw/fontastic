import { Injectable, inject } from '@angular/core';
import { ElectronService } from '../electron/electron.service';
import type { Collection } from '@main/database/entity/Collection.schema';
import type { Logger } from '@main/database/entity/Logger.schema';
import type { Store, StoreManyAndCountType } from '@main/database/entity/Store.schema';
import { ChannelType } from '@main/enums';
import type { FontMetrics, NativeThemeState, SystemConfig, SystemPreferencesState, SystemStats } from '@main/types';
import type { SmartCollection } from '@main/database/entity/SmartCollection.schema';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private electron = inject(ElectronService);

  // Low-level IPC

  on(channel: string, listener: (...args: any[]) => void): Electron.IpcRenderer | undefined {
    if (this.electron.isElectron) {
      return this.electron.ipcRenderer.on(channel, listener);
    }
    return undefined;
  }

  once(channel: string, listener: (...args: any[]) => void): Electron.IpcRenderer | undefined {
    if (this.electron.isElectron) {
      return this.electron.ipcRenderer.once(channel, listener);
    }
    return undefined;
  }

  send(channel: string, args?: any): void {
    if (this.electron.isElectron) {
      this.electron.ipcRenderer.send(channel, args);
    }
  }

  invoke<T = any>(channel: string, args?: any): Promise<T> {
    if (this.electron.isElectron) {
      return this.electron.ipcRenderer.invoke(channel, args);
    }
    return Promise.reject('Not running in Electron');
  }

  removeListener(channel: string, listener: (...args: any[]) => void): Electron.IpcRenderer | undefined {
    if (this.electron.isElectron) {
      return this.electron.ipcRenderer.removeListener(channel, listener);
    }
    return undefined;
  }

  removeAllListeners(channel: string): Electron.IpcRenderer | undefined {
    if (this.electron.isElectron) {
      return this.electron.ipcRenderer.removeAllListeners(channel);
    }
    return undefined;
  }

  // System

  systemBoot(): Promise<SystemConfig> {
    return this.invoke<SystemConfig>(ChannelType.IPC_REQUEST_SYSTEM_BOOT);
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

  fetchLatestNews(args: any): Promise<any> {
    return this.invoke(ChannelType.IPC_FETCH_NEWS, args);
  }

  // Electron Dialogs

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

  // Window

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
    return this.invoke<Collection[]>(ChannelType.IPC_COLLECTION_FIND, args);
  }

  collectionFindOne(args: any): Promise<Collection> {
    return this.invoke<Collection>(ChannelType.IPC_COLLECTION_FIND_ONE, args);
  }

  collectionFindOneBy(args: any): Promise<Collection> {
    return this.invoke<Collection>(ChannelType.IPC_COLLECTION_FIND_ONE_BY, args);
  }

  collectionFetch(args: any): Promise<Collection[]> {
    return this.invoke<Collection[]>(ChannelType.IPC_COLLECTION_FETCH, args);
  }

  collectionCreate(args: any): Promise<Collection[]> {
    return this.invoke<Collection[]>(ChannelType.IPC_COLLECTION_CREATE, args);
  }

  collectionUpdate(collectionId: number, data: any): Promise<Collection[]> {
    return this.invoke<Collection[]>(ChannelType.IPC_COLLECTION_UPDATE, { collectionId, data });
  }

  collectionUpdateIds(ids: any[], data: any): Promise<Collection[]> {
    return this.invoke<Collection[]>(ChannelType.IPC_COLLECTION_UPDATE_IDS, { ids, data });
  }

  collectionDelete(collectionId: number): Promise<Collection[]> {
    return this.invoke<Collection[]>(ChannelType.IPC_COLLECTION_DELETE, { collectionId });
  }

  collectionEnable(collectionId: number, data: any): Promise<Collection[]> {
    return this.invoke<Collection[]>(ChannelType.IPC_COLLECTION_ENABLE, { collectionId, data });
  }

  collectionUpdateCount(id: number): Promise<Collection[]> {
    return this.invoke<Collection[]>(ChannelType.IPC_COLLECTION_UPDATE_COUNT, id);
  }

  collectionUpdateCounts(): Promise<Collection[]> {
    return this.invoke<Collection[]>(ChannelType.IPC_COLLECTION_UPDATE_COUNTS);
  }

  collectionMove(collectionId: number, newParentId: number, newIndex: number): Promise<Collection[]> {
    return this.invoke<Collection[]>(ChannelType.IPC_COLLECTION_MOVE, { collectionId, newParentId, newIndex });
  }

  // Smart Collection

  smartCollectionFind(): Promise<SmartCollection[]> {
    return this.invoke<SmartCollection[]>(ChannelType.IPC_SMART_COLLECTION_FIND);
  }

  smartCollectionCreate(args: any): Promise<SmartCollection[]> {
    return this.invoke<SmartCollection[]>(ChannelType.IPC_SMART_COLLECTION_CREATE, args);
  }

  smartCollectionUpdate(id: number, data: any): Promise<SmartCollection[]> {
    return this.invoke<SmartCollection[]>(ChannelType.IPC_SMART_COLLECTION_UPDATE, { id, data });
  }

  smartCollectionDelete(id: number): Promise<SmartCollection[]> {
    return this.invoke<SmartCollection[]>(ChannelType.IPC_SMART_COLLECTION_DELETE, { id });
  }

  smartCollectionEvaluate(id: number, options: any): Promise<StoreManyAndCountType> {
    return this.invoke<StoreManyAndCountType>(ChannelType.IPC_SMART_COLLECTION_EVALUATE, { id, ...options });
  }

  smartCollectionPreview(rules: any[], matchType: string): Promise<StoreManyAndCountType> {
    return this.invoke<StoreManyAndCountType>(ChannelType.IPC_SMART_COLLECTION_PREVIEW, { rules, match_type: matchType });
  }

  // Store

  storeFind(args: any): Promise<Store[]> {
    return this.invoke<Store[]>(ChannelType.IPC_STORE_FIND, args);
  }

  storeFindOne(args: any): Promise<Store> {
    return this.invoke<Store>(ChannelType.IPC_STORE_FIND_ONE, args);
  }

  storeFindOneBy(args: any): Promise<Store> {
    return this.invoke<Store>(ChannelType.IPC_STORE_FIND_ONE_BY, args);
  }

  storeFetch(options: any): Promise<StoreManyAndCountType> {
    return this.invoke<StoreManyAndCountType>(ChannelType.IPC_STORE_FETCH, options);
  }

  storeSearch(options: any): Promise<StoreManyAndCountType> {
    return this.invoke<StoreManyAndCountType>(ChannelType.IPC_STORE_SEARCH, options);
  }

  storeUpdate(id: number, data: any): Promise<Store> {
    return this.invoke<Store>(ChannelType.IPC_STORE_UPDATE, { id, data });
  }

  syncSystemFonts(): Promise<SystemStats> {
    return this.invoke<SystemStats>(ChannelType.IPC_STORE_SYNC_SYSTEM);
  }

  resetFavorites(): Promise<SystemStats> {
    return this.invoke<SystemStats>(ChannelType.IPC_STORE_RESET_FAVORITES);
  }

  fetchSystemStats(): Promise<SystemStats> {
    return this.invoke<SystemStats>(ChannelType.IPC_STORE_SYSTEM_STATS);
  }

  fontMetrics(filePath: string): Promise<FontMetrics | null> {
    return this.invoke<FontMetrics | null>(ChannelType.IPC_FONT_METRICS, filePath);
  }

  fontGlyphs(filePath: string): Promise<number[]> {
    return this.invoke<number[]>(ChannelType.IPC_FONT_GLYPHS, filePath);
  }

  // Logger

  log(message: string, type: number): Promise<Logger[]> {
    return this.loggerCreate(message, type);
  }

  loggerFind(args: any): Promise<Logger[]> {
    return this.invoke<Logger[]>(ChannelType.IPC_LOGGER_FIND, args);
  }

  loggerFindOne(args: any): Promise<Logger> {
    return this.invoke<Logger>(ChannelType.IPC_LOGGER_FIND_ONE, args);
  }

  loggerFindOneBy(args: any): Promise<Logger> {
    return this.invoke<Logger>(ChannelType.IPC_LOGGER_FIND_ONE_BY, args);
  }

  loggerCreate(message: string, type: number): Promise<Logger[]> {
    return this.invoke<Logger[]>(ChannelType.IPC_LOGGER_CREATE, { message, type });
  }

  loggerDelete(id: number): Promise<Logger[]> {
    return this.invoke<Logger[]>(ChannelType.IPC_LOGGER_DELETE, { id });
  }

  loggerTruncate(): Promise<Logger[]> {
    return this.invoke<Logger[]>(ChannelType.IPC_LOGGER_TRUNCATE);
  }

  // Native Theme

  getNativeTheme(): Promise<NativeThemeState> {
    return this.invoke<NativeThemeState>(ChannelType.IPC_GET_NATIVE_THEME);
  }

  // Safe Storage

  safeStore(key: string, value: string): Promise<void> {
    return this.invoke(ChannelType.IPC_SAFE_STORE, { key, value });
  }

  safeRetrieve(key: string): Promise<string | null> {
    return this.invoke<string | null>(ChannelType.IPC_SAFE_RETRIEVE, key);
  }

  // Session

  clearCache(): Promise<void> {
    return this.invoke(ChannelType.IPC_CLEAR_CACHE);
  }

  // System Preferences

  getSystemPreferences(): Promise<SystemPreferencesState> {
    return this.invoke<SystemPreferencesState>(ChannelType.IPC_GET_SYSTEM_PREFERENCES);
  }
}
