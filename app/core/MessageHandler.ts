import { ipcMain, IpcMainEvent } from 'electron';

import SystemManager from './SystemManager';
import ConfigManager from './ConfigManager';
import ConnectionManager from './ConnectionManager';
import FontManager from './FontManager';
import AppLogger from './AppLogger'

import * as channel from '../config/channel';

export default class MessageHandler {

  systemManager: SystemManager;
  configManager: ConfigManager;
  connectionManager: ConnectionManager;
  fontManager: FontManager;

  constructor(
    systemManager: SystemManager,
    configManager: ConfigManager,
    connectionManager: ConnectionManager,
    fontManager: FontManager
  ) {
    this.setSystemManager(systemManager);
    this.setConfigManager(configManager);
    this.setConnectionManager(connectionManager);
    this.setFontManager(fontManager);
  }

  setSystemManager(systemManager: SystemManager) {
    this.systemManager = systemManager;
  }

  getSystemManager(): SystemManager {
    return this.systemManager;
  }

  setConfigManager(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  getConfigManager(): ConfigManager {
    return this.configManager;
  }

  setConnectionManager(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;
  }

  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  setFontManager(fontManager: FontManager) {
    this.fontManager = fontManager;
  }

  getFontManager(): FontManager {
    return this.fontManager;
  }

  on(channel: string, done: any) {
    return ipcMain.on(channel, done);
  }

  initialize() {

    this.on(channel.IPCMAIN_REQUEST_SYSTEM_BOOT, async (event: IpcMainEvent, args: any) => {
      let config = this.getConfigManager().get();
      let system = this.getSystemManager().toArray();
      const response = {
        ...config,
        system: system
      };
      event.sender.send(channel.IPCMAIN_RESPONSE_SYSTEM_BOOT, response);
    });

    this.on(channel.IPCMAIN_REQUEST_SYSTEM_RESET, async (event: IpcMainEvent, args: any) => {
      this.getFontManager().reLaunch()
      event.sender.send(channel.IPCMAIN_RESPONSE_SYSTEM_RESET, {});
    });

    /**
     * Config Manager
     */

    this.on(channel.IPCMAIN_REQUEST_SET_CONFIG, async (event: IpcMainEvent, args: any) => {
      this.getConfigManager().set(args.key, args.values);
      event.sender.send(channel.IPCMAIN_RESPONSE_SET_CONFIG, args);
    });

    this.on(channel.IPCMAIN_REQUEST_GET_CONFIG, async (event: IpcMainEvent, args: any) => {
      const saved = this.getConfigManager().get(args.key);
      event.sender.send(channel.IPCMAIN_RESPONSE_SET_CONFIG, saved);
    });

    this.on(channel.IPCMAIN_REQUEST_CLEAR_STORE, async (event: IpcMainEvent) => {
      const response = this.getConfigManager().clear();
      event.sender.send(channel.IPCMAIN_RESPONSE_CLEAR_STORE, response);
    });

    /**
     * Connection Manager
     */

    this.on(channel.IPCMAIN_REQUEST_SAVE_DBCONNECTION, async (event: IpcMainEvent, options: any) => {
      if (options.name === 'default') {
        event.sender.send(channel.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, this.getConfigManager().get('database').connections);
      } else {
        this.getConfigManager().saveDbConnection(options);
        event.sender.send(channel.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, this.getConfigManager().get('database').connections);
      }
    });

    this.on(channel.IPCMAIN_REQUEST_DELETE_DBCONNECTION, async (event: IpcMainEvent, name: string) => {
      if (name === 'default') {
        event.sender.send(channel.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, this.getConfigManager().get('database').connections);
      } else {
        this.getConfigManager().deleteDbConnection(name);
        event.sender.send(channel.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, this.getConfigManager().get('database').connections);
      }
    });

    this.on(channel.IPCMAIN_REQUEST_ENABLE_DBCONNECTION, (event: IpcMainEvent, item: any) => {
      this.getConfigManager().enableDbConnection(item);
      event.sender.send(channel.IPCMAIN_RESPONSE_ENABLE_DBCONNECTION, item);
    });

    this.on(channel.IPCMAIN_REQUEST_TEST_CONNECTION, async (event: IpcMainEvent, args: any) => {
      let activeConnectionOptions = this.getConnectionManager().dataSource.options;
      if (activeConnectionOptions.database === args.database) {
        this.getConnectionManager().isInitialized().then(() => {
          event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'success', message: 'Connection tested successfully' });
        }).catch((err) => {
          event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'error', message: err.message });
        });
      } else {
        this.getConnectionManager().createDataSourceWithOptions(args).then(() => {
          event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'success', message: 'Connection tested successfully' });
        }).catch((err) => {
          event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'error', message: err.message });
        });
      }
    });

    this.on(channel.IPCMAIN_REQUEST_DROP_DATABASE, async (event: IpcMainEvent) => {
      await this.getConnectionManager().dropDatabase().then(() => {
        event.sender.send(channel.IPCMAIN_RESPONSE_DROP_DATABASE, { type: 'IPCMAIN_RESPONSE_DROP_DATABASE' });
      });
    });

    /**
     * Font Manager
     */

    this.on(channel.IPCMAIN_REQUEST_EXECUTE_COMMAND, async (event: IpcMainEvent, args: any) => {
      await this.getFontManager().executeCommand(args).then((response) => {
        event.sender.send(channel.IPCMAIN_RESPONSE_EXECUTE_COMMAND, response);
      }).catch((err) => event.sender.send(channel.IPCMAIN_RESPONSE_EXECUTE_COMMAND, err.message));
    });

    this.on(channel.IPCMAIN_REQUEST_FILES_SCAN, async (event: IpcMainEvent, args: any) => {
      const promises = [];

      const addToCatalog = async () => {
        const dest = this.getFontManager().getDestinationFolder();
        await this.getFontManager().createCatalog(dest);
        await this.getFontManager().copyFiles(args.files, dest);
        const files = this.getFontManager().getMapFilePaths(args.files, dest);
        await this.getFontManager().scanFiles(files, { collection_id: args.collectionId });
      }

      const addInPlace = async () => {
        await this.getFontManager().scanFiles(args.files, { collection_id: args.collectionId });
      }

      if (args.addToCatalog) {
        promises.push(addToCatalog());
      } else {
        promises.push(addInPlace());
      }

      Promise.allSettled(promises).then(async () => {
        const result = await this.fetchStore();
        event.sender.send(channel.IPCMAIN_RESPONSE_FILES_SCAN, result);
      });
    });

    this.on(channel.IPCMAIN_REQUEST_FOLDERS_SCAN, async (event: IpcMainEvent, args: any) => {
      const promises = [];

      args.folders.forEach(async (sourceFolder: string, i: number) => {
        
        const addToCatalog = async () => {
          const folders = this.getFontManager().getSourceDestinationFolders(sourceFolder);
          await this.getFontManager().createCatalog(folders.dest);
          await this.getFontManager().copyFolders(folders.src, folders.dest);
          await this.getFontManager().scanFolders(folders.dest, { collection_id: args.collectionId });
        }

        const addInPlace = async () => {
          await this.getFontManager().scanFolders(sourceFolder, { collection_id: args.collectionId });
        }

        if (args.addToCatalog) {
          promises.push(addToCatalog());
        } else {
          promises.push(addInPlace());
        }
      });

      Promise.allSettled(promises).then(async () => {
        const result = await this.fetchStore();
        event.sender.send(channel.IPCMAIN_RESPONSE_FOLDERS_SCAN, result);
      });
    });

    this.on(channel.IPCMAIN_REQUEST_FONT_ACTIVATION, async (event: IpcMainEvent, args: any) => {
      this.getFontManager().fontInstaller(args).then(async (response: any) => {
        AppLogger.getInstance().info(response);
        const result = await this.fetchStore();
        event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, result);
      }).catch((err) => event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, err.message));
    });

    this.on(channel.IPCMAIN_REQUEST_AUTH_USER, async (event: IpcMainEvent, args: any) => {
      await this.getFontManager().systemAuthenticate(args).then((response: any) => {
        event.sender.send(channel.IPCMAIN_RESPONSE_AUTH_USER, response);
      });
    });

    this.on(channel.IPCMAIN_REQUEST_FETCH_NEWS, async (event: IpcMainEvent, args: any) => {
      await this.getFontManager().fetchLatestNews(args).then((response: any) => {
        event.sender.send(channel.IPCMAIN_RESPONSE_FETCH_NEWS, response);
      });
    });

    this.on(channel.IPCMAIN_REQUEST_NEWS_CONTENT, async (event: IpcMainEvent, url: string) => {
      await this.getFontManager().fetchNewsContent(url).then((response: any) => {
        event.sender.send(channel.IPCMAIN_RESPONSE_NEWS_CONTENT, response);
      });
    });

    this.on(channel.IPCMAIN_REQUEST_MESSAGE_BOX, async (event: IpcMainEvent, options: any) => {
      this.getFontManager().showDialogBox(options).then((response: any) => event.sender.send(channel.IPCMAIN_RESPONSE_MESSAGE_BOX, response));
    });

    this.on(channel.IPCMAIN_REQUEST_OPEN_DIALOG, async (event: IpcMainEvent, options: any) => {
      this.getFontManager().showOpenDialog(options).then((response: any) => event.sender.send(channel.IPCMAIN_RESPONSE_OPEN_DIALOG, response));
    });

    this.on(channel.IPCMAIN_REQUEST_OPEN_PATH, async (event: IpcMainEvent, path: string) => this.getFontManager().openPath(path));

    this.on(channel.IPCMAIN_REQUEST_OPEN_FOLDER, async (event: IpcMainEvent, fullPath: string) => this.getFontManager().showItemInFolder(fullPath));

    this.on(channel.IPCMAIN_REQUEST_OPEN_EXTERNAL, async (event: IpcMainEvent, url: string) => this.getFontManager().openExternal(url));

    this.on(channel.IPCMAIN_REQUEST_RELOAD_WINDOW, async (event: IpcMainEvent) => this.getFontManager().reLaunch());

    this.on(channel.IPCMAIN_REQUEST_EXIT, async (event: IpcMainEvent) => this.getFontManager().exit());

    this.on(channel.IPCMAIN_REQUEST_QUIT, async (event: IpcMainEvent) => this.getFontManager().quit());

    this.on(channel.IPCMAIN_REQUEST_BEEP, async (event: IpcMainEvent) => this.getFontManager().beep());

    /**
     * Collection
     */

    this.on(channel.IPCMAIN_REQUEST_FETCH_COLLECTIONS, async (event: IpcMainEvent, ...args: any[]) => {
      const result = await this.getConnectionManager().getCollection().find(...args);
      event.sender.send(channel.IPCMAIN_RESPONSE_FETCH_COLLECTIONS, result);
    });

    this.on(channel.IPCMAIN_REQUEST_CREATE_COLLECTION, async (event: IpcMainEvent, parentId: number) => {
      await this.getConnectionManager().getCollectionRepository().createCollection(parentId);
      const result = await this.getConnectionManager().getCollection().find();
      event.sender.send(channel.IPCMAIN_RESPONSE_CREATE_COLLECTION, result);
    });

    this.on(channel.IPCMAIN_REQUEST_DELETE_COLLECTION, async (event: IpcMainEvent, collectionId: number) => {
      await this.getConnectionManager().getCollectionRepository().deleteCollection(collectionId);
      await this.getConnectionManager().getStoreRepository().deleteCollection(collectionId);
      const result = await this.getConnectionManager().getCollection().find();
      event.sender.send(channel.IPCMAIN_RESPONSE_DELETE_COLLECTION, result);
    });

    this.on(channel.IPCMAIN_REQUEST_UPDATE_COLLECTION, async (event: IpcMainEvent, args: any) => {
      await this.getConnectionManager().getCollectionRepository().updateCollection(args);
      const result = await this.getConnectionManager().getCollection().find();
      event.sender.send(channel.IPCMAIN_RESPONSE_UPDATE_COLLECTION, result);
    });

    this.on(channel.IPCMAIN_REQUEST_RESET_ENABLED, async (event: IpcMainEvent) => {
      await this.getConnectionManager().getCollectionRepository().resetEnabled();
      const result = await this.getConnectionManager().getCollection().find();
      event.sender.send(channel.IPCMAIN_RESPONSE_RESET_ENABLED, result);
    });

    /**
     * Store
     */

    this.on(channel.IPCMAIN_REQUEST_STORE_FETCH_ALL, async (event: IpcMainEvent, args: any) => {
      let [results, total] = (args.search) ?
        await this.getConnectionManager().getStoreRepository().search(args) :
        await this.getConnectionManager().getStoreRepository().fetch(args);
      event.sender.send(channel.IPCMAIN_RESPONSE_STORE_FETCH_ALL, [total, results]);
    });

    this.on(channel.IPCMAIN_REQUEST_STORE_FETCH_ROW, async (event: IpcMainEvent, storeId: number) => {
      const result = await this.getConnectionManager().getStoreRepository().findOne({ where: { id: storeId } });
      event.sender.send(channel.IPCMAIN_RESPONSE_STORE_FETCH_ROW, result);
    });

    this.on(channel.IPCMAIN_REQUEST_STORE_UPDATE, async (event: IpcMainEvent, args: any) => {
      let result = await this.getConnectionManager().getStoreRepository().update(args.id, args.data);
      event.sender.send(channel.IPCMAIN_RESPONSE_STORE_UPDATE, result);
    });

    this.on(channel.IPCMAIN_REQUEST_UPDATE_COUNT, async (event: IpcMainEvent, collectionId: number) => {
      const { total } = await this.getConnectionManager().getStoreRepository().fetchCollectionCount(collectionId);
      await this.getConnectionManager().getCollectionRepository().updateCollectionCount(collectionId, total);
      const result = await this.getConnectionManager().getCollection().find();
      event.sender.send(channel.IPCMAIN_RESPONSE_UPDATE_COUNT, result);
    });

    this.on(channel.IPCMAIN_REQUEST_UPDATE_COUNTS, async (event: IpcMainEvent) => {
      const items = await this.getConnectionManager().getStoreRepository().fetchCollectionsCount();
      await this.getConnectionManager().getCollectionRepository().updateCollectionCounts(items);
      const result = await this.getConnectionManager().getCollection().find();
      event.sender.send(channel.IPCMAIN_RESPONSE_UPDATE_COUNTS, result);
    });

    this.on(channel.IPCMAIN_REQUEST_SYNC_SYSTEM, async (event: IpcMainEvent) => {
      await this.getConnectionManager().getStoreRepository().resetSystem();
      const paths = this.getSystemManager().getPlatformFontPaths();

      const promises = [];
      paths.forEach(async (path: string, i: number) => {
        promises.push(this.getFontManager().scanFolders(path, { collection_id: 0, system: 1 }).catch((err: Error) => {
          AppLogger.getInstance().error(err);
        }));
      });

      Promise.allSettled(promises).then(async () => {
        const result = await this.getConnectionManager().getStoreRepository().fetchSystemStats();
        event.sender.send(channel.IPCMAIN_RESPONSE_SYNC_SYSTEM, result);
      });
    });

    this.on(channel.IPCMAIN_REQUEST_SYNC_ACTIVATED, async (event: IpcMainEvent) => {
      await this.getConnectionManager().getStoreRepository().resetActivated();
      await this.getConnectionManager().getStoreRepository().syncActivated().then((result: any) => {
        event.sender.send(channel.IPCMAIN_RESPONSE_SYNC_ACTIVATED, result);
      });
    });

    this.on(channel.IPCMAIN_REQUEST_RESET_FAVORITES, async (event: IpcMainEvent) => {
      const results = await this.getConnectionManager().getStoreRepository().resetFavorites();
      event.sender.send(channel.IPCMAIN_RESPONSE_RESET_FAVORITES, results);
    });

    this.on(channel.IPCMAIN_REQUEST_SYSTEM_STATS, async (event: IpcMainEvent) => {
      const results = await this.getConnectionManager().getStoreRepository().fetchSystemStats();
      event.sender.send(channel.IPCMAIN_RESPONSE_SYSTEM_STATS, results);
    });

    /**
     * Logger
     */

    this.on(channel.IPCMAIN_REQUEST_LOGGER_CREATE, async (event: IpcMainEvent, args: any) => {
      await this.getConnectionManager().getLoggerRepository().log(args);
      const result = await this.fetchLogger();
      event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_CREATE, result);
    });

    this.on(channel.IPCMAIN_REQUEST_LOGGER_QUERY, async (event: IpcMainEvent, args: any) => {
      const result = await this.fetchLogger();
      event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_QUERY, result);
    });

    this.on(channel.IPCMAIN_REQUEST_LOGGER_DELETE_ITEM, async (event: IpcMainEvent, args: any) => {
      await this.getConnectionManager().getLogger().delete(args.id);
      const result = await this.fetchLogger();
      event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_DELETE_ITEM, result);
    });

    this.on(channel.IPCMAIN_REQUEST_LOGGER_TRUNCATE, async (event: IpcMainEvent, args: any) => {
      await this.getConnectionManager().getLogger().clear();
      const result = await this.fetchLogger();
      event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_TRUNCATE, result);
    });
  }

  async fetchStore() {
    return await this.getConnectionManager().getStore().find({ order: { id: 'DESC' }, skip: 0, take: 100 });
  }

  async fetchLogger() {
    return await this.getConnectionManager().getLogger().find({ order: { id: 'DESC' }, skip: 0, take: 100 });
  }

}