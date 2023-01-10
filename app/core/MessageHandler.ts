import { ipcMain, IpcMainEvent } from 'electron';

import SystemManager from './SystemManager';
import ConfigManager from './ConfigManager';
import ConnectionManager from './ConnectionManager';
import FontManager from './FontManager';
import AppLogger from './AppLogger'

import { Collection } from '../database/entity/Collection.schema';
import { Logger } from '../database/entity/Logger.schema';
import { Store, StoreManyAndCountType } from '../database/entity/Store.schema';

import { ChannelType, StorageType } from '../enums';
import { SystemConfig } from '../types';

export default class MessageHandler {

  systemManager: SystemManager;
  configManager: ConfigManager;
  connectionManager: ConnectionManager;
  fontManager: FontManager;

  constructor(systemManager: SystemManager, configManager: ConfigManager, connectionManager: ConnectionManager, fontManager: FontManager) {
    this.systemManager = systemManager;
    this.configManager = configManager;
    this.connectionManager = connectionManager;
    this.fontManager = fontManager;
  }

  on(channel: string, done: any) {
    return ipcMain.on(channel, done);
  }

  send(event: IpcMainEvent, channel: string, data: any): void {
    event.sender.send(channel, data);
  }

  handle(channel: string, done: any) {
    return ipcMain.handle(channel, done);
  }

  initialize() {
    this.handle(ChannelType.IPCMAIN_SYSTEM_BOOT, async (_event: IpcMainEvent, _args: any) => {
      let config = this.configManager.get();
      let system = this.systemManager.toArray();
      const response: SystemConfig = { ...config, system: system };
      return response;
    });

    this.on(ChannelType.IPCMAIN_REQUEST_SYSTEM_RESET, async (event: IpcMainEvent, _args: any) => {
      this.fontManager.reLaunch()
      this.send(event, ChannelType.IPCMAIN_RESPONSE_SYSTEM_RESET, {});
    });

    /**
     * Config Manager
     */

    this.on(ChannelType.IPCMAIN_REQUEST_SET_CONFIG, async (event: IpcMainEvent, args: any) => {
      this.configManager.set(args.key, args.values);
      const saved = this.configManager.get(args.key);
      this.send(event, ChannelType.IPCMAIN_RESPONSE_SET_CONFIG, saved);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_GET_CONFIG, async (event: IpcMainEvent, args: any) => {
      const saved = this.configManager.get(args.key);
      this.send(event, ChannelType.IPCMAIN_RESPONSE_SET_CONFIG, saved);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_CLEAR_STORE, async (event: IpcMainEvent) => {
      const response = this.configManager.clear();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_CLEAR_STORE, response);
    });

    /**
     * Connection Manager
     */

    this.on(ChannelType.IPCMAIN_REQUEST_SAVE_DBCONNECTION, async (event: IpcMainEvent, options: any) => {
      if (options.name === 'default') {
        this.send(event, ChannelType.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, this.configManager.get(StorageType.DatabaseConnections));
      } else {
        this.configManager.saveDbConnection(options);
        this.send(event, ChannelType.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, this.configManager.get(StorageType.DatabaseConnections));
      }
    });

    this.on(ChannelType.IPCMAIN_REQUEST_DELETE_DBCONNECTION, async (event: IpcMainEvent, name: string) => {
      if (name === 'default') {
        this.send(event, ChannelType.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, this.configManager.get(StorageType.DatabaseConnections));
      } else {
        this.configManager.deleteDbConnection(name);
        this.send(event, ChannelType.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, this.configManager.get(StorageType.DatabaseConnections));
      }
    });

    this.on(ChannelType.IPCMAIN_REQUEST_ENABLE_DBCONNECTION, (event: IpcMainEvent, item: any) => {
      this.configManager.enableDbConnection(item);
      this.send(event, ChannelType.IPCMAIN_RESPONSE_ENABLE_DBCONNECTION, item);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_TEST_CONNECTION, async (event: IpcMainEvent, args: any) => {
      let activeConnectionOptions = this.connectionManager.dataSource.options;
      if (activeConnectionOptions.database === args.database) {
        this.connectionManager.isInitialized().then(() => {
          this.send(event, ChannelType.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'success', message: 'Connection tested successfully' });
        }).catch((err: Error) => {
          this.send(event, ChannelType.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'error', message: err.message });
        });
      } else {
        this.connectionManager.createDataSource(args).then(() => {
          this.send(event, ChannelType.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'success', message: 'Connection tested successfully' });
        }).catch((err: Error) => {
          this.send(event, ChannelType.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'error', message: err.message });
        });
      }
    });

    this.on(ChannelType.IPCMAIN_REQUEST_DROP_DATABASE, async (event: IpcMainEvent) => {
      this.connectionManager.dropDatabase().then(() => {
        this.send(event, ChannelType.IPCMAIN_RESPONSE_DROP_DATABASE, { type: 'success', message: 'Database droped successfully' });
      }).catch((err: Error) => {
        this.send(event, ChannelType.IPCMAIN_RESPONSE_DROP_DATABASE, { type: 'error', message: err.message });
      });
    });

    /**
     * Font Manager
     */

    this.on(ChannelType.IPCMAIN_REQUEST_EXECUTE_COMMAND, async (event: IpcMainEvent, args: any) => {
      await this.fontManager.executeCommand(args).then((response) => {
        this.send(event, ChannelType.IPCMAIN_RESPONSE_EXECUTE_COMMAND, response);
      }).catch((err: Error) => this.send(event, ChannelType.IPCMAIN_RESPONSE_EXECUTE_COMMAND, err.message));
    });

    this.on(ChannelType.IPCMAIN_REQUEST_FILES_SCAN, async (event: IpcMainEvent, args: any) => {
      const promises = [];

      const addToCatalog = async () => {
        const dest = this.fontManager.getDestinationFolder();
        await this.fontManager.createCatalog(dest);
        await this.fontManager.copyFiles(args.files, dest);
        const files = this.fontManager.getMapFilePaths(args.files, dest);
        await this.fontManager.scanFiles(files, { collection_id: args.collectionId });
      }

      const addInPlace = async () => {
        await this.fontManager.scanFiles(args.files, { collection_id: args.collectionId });
      }

      if (args.addToCatalog) {
        promises.push(addToCatalog());
      } else {
        promises.push(addInPlace());
      }

      Promise.allSettled(promises).then(async () => {
        const result = await this.fetchStore();
        this.send(event, ChannelType.IPCMAIN_RESPONSE_FILES_SCAN, result);
      });
    });

    this.on(ChannelType.IPCMAIN_REQUEST_FOLDERS_SCAN, async (event: IpcMainEvent, args: any) => {
      const promises = [];

      args.folders.forEach(async (sourceFolder: string, _i: number) => {

        const addToCatalog = async () => {
          const folders = this.fontManager.getSourceDestinationFolders(sourceFolder);
          await this.fontManager.createCatalog(folders.dest);
          await this.fontManager.copyFolders(folders.src, folders.dest);
          await this.fontManager.scanFolders(folders.dest, { collection_id: args.collectionId });
        }

        const addInPlace = async () => {
          await this.fontManager.scanFolders(sourceFolder, { collection_id: args.collectionId });
        }

        if (args.addToCatalog) {
          promises.push(addToCatalog());
        } else {
          promises.push(addInPlace());
        }
      });

      Promise.allSettled(promises).then(async () => {
        const result = await this.fetchStore();
        this.send(event, ChannelType.IPCMAIN_RESPONSE_FOLDERS_SCAN, result);
      });
    });

    this.on(ChannelType.IPCMAIN_REQUEST_FONT_ACTIVATION, async (event: IpcMainEvent, args: any) => {
      this.fontManager.fontInstaller(args).then(async (response: any) => {
        AppLogger.getInstance().info(response);
        const result = await this.fetchStore();
        this.send(event, ChannelType.IPCMAIN_RESPONSE_FONT_ACTIVATION, result);
      }).catch((err: Error) => this.send(event, ChannelType.IPCMAIN_RESPONSE_FONT_ACTIVATION, err.message));
    });

    this.on(ChannelType.IPCMAIN_REQUEST_AUTH_USER, async (event: IpcMainEvent, args: any) => {
      await this.fontManager.systemAuthenticate(args).then((response: any) => {
        this.send(event, ChannelType.IPCMAIN_RESPONSE_AUTH_USER, response);
      });
    });

    this.on(ChannelType.IPCMAIN_REQUEST_FETCH_NEWS, async (event: IpcMainEvent, args: any) => {
      await this.fontManager.fetchLatestNews(args).then((response: any) => {
        this.send(event, ChannelType.IPCMAIN_RESPONSE_FETCH_NEWS, response);
      });
    });

    this.on(ChannelType.IPCMAIN_REQUEST_NEWS_CONTENT, async (event: IpcMainEvent, url: string) => {
      await this.fontManager.fetchNewsContent(url).then((response: any) => {
        this.send(event, ChannelType.IPCMAIN_RESPONSE_NEWS_CONTENT, response);
      });
    });

    this.on(ChannelType.IPCMAIN_REQUEST_MESSAGE_BOX, async (event: IpcMainEvent, options: any) => {
      this.fontManager.showDialogBox(options).then((response: any) => this.send(event, ChannelType.IPCMAIN_RESPONSE_MESSAGE_BOX, response));
    });

    this.on(ChannelType.IPCMAIN_REQUEST_OPEN_DIALOG, async (event: IpcMainEvent, options: any) => {
      this.fontManager.showOpenDialog(options).then((response: any) => this.send(event, ChannelType.IPCMAIN_RESPONSE_OPEN_DIALOG, response));
    });

    this.on(ChannelType.IPCMAIN_REQUEST_OPEN_PATH, async (_event: IpcMainEvent, path: string) => this.fontManager.openPath(path));

    this.on(ChannelType.IPCMAIN_REQUEST_OPEN_FOLDER, async (_event: IpcMainEvent, fullPath: string) => this.fontManager.showItemInFolder(fullPath));

    this.on(ChannelType.IPCMAIN_REQUEST_OPEN_EXTERNAL, async (_event: IpcMainEvent, url: string) => this.fontManager.openExternal(url));

    this.on(ChannelType.IPCMAIN_REQUEST_RELOAD_WINDOW, async (_event: IpcMainEvent) => this.fontManager.reLaunch());

    this.on(ChannelType.IPCMAIN_REQUEST_EXIT, async (_event: IpcMainEvent) => this.fontManager.exit());

    this.on(ChannelType.IPCMAIN_REQUEST_QUIT, async (_event: IpcMainEvent) => this.fontManager.quit());

    this.on(ChannelType.IPCMAIN_REQUEST_BEEP, async (_event: IpcMainEvent) => this.fontManager.beep());

    /**
     * Collection
     */

    this.on(ChannelType.IPCMAIN_REQUEST_FETCH_COLLECTIONS, async (event: IpcMainEvent, ...args: any[]) => {
      const result: Collection[] = await this.connectionManager.getCollection().find(...args);
      this.send(event, ChannelType.IPCMAIN_RESPONSE_FETCH_COLLECTIONS, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_CREATE_COLLECTION, async (event: IpcMainEvent, parentId: number) => {
      await this.connectionManager.getCollectionRepository().createCollection(parentId);
      const result: Collection[] = await this.connectionManager.getCollection().find();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_CREATE_COLLECTION, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_DELETE_COLLECTION, async (event: IpcMainEvent, collectionId: number) => {
      await this.connectionManager.getCollectionRepository().deleteCollection(collectionId);
      await this.connectionManager.getStoreRepository().deleteCollection(collectionId);
      const result: Collection[] = await this.connectionManager.getCollection().find();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_DELETE_COLLECTION, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_UPDATE_COLLECTION, async (event: IpcMainEvent, args: any) => {
      await this.connectionManager.getCollectionRepository().updateCollection(args);
      const result: Collection[] = await this.connectionManager.getCollection().find();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_UPDATE_COLLECTION, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_RESET_ENABLED, async (event: IpcMainEvent) => {
      await this.connectionManager.getCollectionRepository().resetEnabled();
      const result: Collection[] = await this.connectionManager.getCollection().find();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_RESET_ENABLED, result);
    });

    /**
     * Store
     */

    this.on(ChannelType.IPCMAIN_REQUEST_STORE_FETCH_ALL, async (event: IpcMainEvent, args: any) => {
      if (args.search) {
        const result: StoreManyAndCountType = await this.connectionManager.getStoreRepository().search(args);
        this.send(event, ChannelType.IPCMAIN_RESPONSE_STORE_FETCH_ALL, result);
      } else {
        const result: StoreManyAndCountType = await this.connectionManager.getStoreRepository().fetch(args);
        this.send(event, ChannelType.IPCMAIN_RESPONSE_STORE_FETCH_ALL, result);
      }
    });

    this.on(ChannelType.IPCMAIN_REQUEST_STORE_FETCH_ROW, async (event: IpcMainEvent, storeId: number) => {
      const result: Store = await this.connectionManager.getStoreRepository().findOne({ where: { id: storeId } });
      this.send(event, ChannelType.IPCMAIN_RESPONSE_STORE_FETCH_ROW, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_STORE_UPDATE, async (event: IpcMainEvent, args: any) => {
      await this.connectionManager.getStoreRepository().update(args.id, args.data);
      const result: Store = await this.connectionManager.getStoreRepository().findOne({ where: { id: args.id } });
      this.send(event, ChannelType.IPCMAIN_RESPONSE_STORE_UPDATE, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_UPDATE_COUNT, async (event: IpcMainEvent, collectionId: number) => {
      const { total } = await this.connectionManager.getStoreRepository().fetchCollectionCount(collectionId);
      await this.connectionManager.getCollectionRepository().updateCollectionCount(collectionId, total);
      const result: Collection[] = await this.connectionManager.getCollection().find();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_UPDATE_COUNT, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_UPDATE_COUNTS, async (event: IpcMainEvent) => {
      const items = await this.connectionManager.getStoreRepository().fetchCollectionsCount();
      await this.connectionManager.getCollectionRepository().updateCollectionCounts(items);
      const result: Collection[] = await this.connectionManager.getCollection().find();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_UPDATE_COUNTS, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_SYNC_SYSTEM, async (event: IpcMainEvent) => {
      await this.connectionManager.getStoreRepository().resetSystem();
      const paths = this.systemManager.getPlatformFontPaths();
      const promises = [];
      paths.forEach(async (folder: string) => {
        promises.push(this.fontManager.scanFolders(folder, { collection_id: 0, system: 1 }).catch((err: Error) => AppLogger.getInstance().error(err)));
      });
      Promise.allSettled(promises).then(async () => {
        const result = await this.connectionManager.getStoreRepository().fetchSystemStats();
        this.send(event, ChannelType.IPCMAIN_RESPONSE_SYNC_SYSTEM, result);
      });
    });

    this.on(ChannelType.IPCMAIN_REQUEST_SYNC_ACTIVATED, async (event: IpcMainEvent) => {
      await this.connectionManager.getStoreRepository().resetActivated();
      await this.connectionManager.getStoreRepository().syncActivated();
      const result = await this.connectionManager.getStoreRepository().fetchSystemStats();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_SYNC_ACTIVATED, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_RESET_FAVORITES, async (event: IpcMainEvent) => {
      await this.connectionManager.getStoreRepository().resetFavorites();
      const result = await this.connectionManager.getStoreRepository().fetchSystemStats();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_RESET_FAVORITES, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_SYSTEM_STATS, async (event: IpcMainEvent) => {
      const results = await this.connectionManager.getStoreRepository().fetchSystemStats();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_SYSTEM_STATS, results);
    });

    /**
     * Logger
     */

    this.on(ChannelType.IPCMAIN_REQUEST_LOGGER_CREATE, async (event: IpcMainEvent, args: any) => {
      await this.connectionManager.getLoggerRepository().log(args);
      const result: Logger[] = await this.fetchLogger();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_LOGGER_CREATE, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_LOGGER_QUERY, async (event: IpcMainEvent) => {
      const result: Logger[] = await this.fetchLogger();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_LOGGER_QUERY, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_LOGGER_DELETE_ITEM, async (event: IpcMainEvent, args: any) => {
      await this.connectionManager.getLogger().delete(args.id);
      const result: Logger[] = await this.fetchLogger();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_LOGGER_DELETE_ITEM, result);
    });

    this.on(ChannelType.IPCMAIN_REQUEST_LOGGER_TRUNCATE, async (event: IpcMainEvent) => {
      await this.connectionManager.getLogger().clear();
      const result: Logger[] = await this.fetchLogger();
      this.send(event, ChannelType.IPCMAIN_RESPONSE_LOGGER_TRUNCATE, result);
    });
  }

  async fetchStore(): Promise<Store[]> {
    return await this.connectionManager.getStore().find({ order: { id: 'DESC' }, skip: 0, take: 100 });
  }

  async fetchCollection(): Promise<Collection[]> {
    return await this.connectionManager.getCollection().find({ order: { id: 'DESC' }, skip: 0 });
  }

  async fetchLogger(): Promise<Logger[]> {
    return await this.connectionManager.getLogger().find({ order: { id: 'DESC' }, skip: 0, take: 100 });
  }
}
