import { ipcMain, IpcMainEvent } from 'electron';

import SystemManager from './SystemManager';
import ConfigManager from './ConfigManager';
import ConnectionManager from './ConnectionManager';
import FontManager from './FontManager';
import AppLogger from './AppLogger'

import { Collection } from '../database/entity/Collection.schema';
// import { Logger } from '../database/entity/Logger.schema';
// import { Store, StoreManyAndCountType } from '../database/entity/Store.schema';

import { ChannelType } from '../enums/ChannelType';
import { StorageType } from '../enums/StorageType';

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
    this.systemManager = systemManager;
    this.configManager = configManager;
    this.connectionManager = connectionManager;
    this.fontManager = fontManager;
  }

  on(channel: string, done: any) {
    return ipcMain.on(channel, done);
  }

  send(event: IpcMainEvent, channel: string, data: any) {
    return event.sender.send(channel, data);
  }

  handle(channel: string, done: any) {
    return ipcMain.handle(channel, done);
  }

  initialize() {
    this.initSystemCollection();

    this.on(ChannelType.IPC_REQUEST_SYSTEM_BOOT, async (event: IpcMainEvent, _args: any) => {
      let config = this.configManager.toArray();
      let system = this.systemManager.toArray();
      const response: StorageType = { ...config, system: system };
      this.send(event, ChannelType.IPC_RESPONSE_SYSTEM_BOOT, response);
    });

    this.on(ChannelType.IPC_SYSTEM_REBOOT, async (_event: IpcMainEvent, _args: any) => this.fontManager.reLaunch());

    // Config Manager

    this.handle(ChannelType.IPC_SET_CONFIG, async (_event: IpcMainEvent, args: any) => this.configManager.set(args.key, args.values));
    this.handle(ChannelType.IPC_GET_CONFIG, async (_event: IpcMainEvent, args: any) => this.configManager.get(args.key));
    this.handle(ChannelType.IPC_ZAP_CONFIG, async (_event: IpcMainEvent) => this.configManager.clear());

    // Connection Manager

    this.handle(ChannelType.IPC_DBCONNECTION_CREATE, async (_event: IpcMainEvent, args: any) => this.configManager.createDbConnection(args));
    this.handle(ChannelType.IPC_DBCONNECTION_ENABLE, (_event: IpcMainEvent, args: any) => this.configManager.enableDbConnection(args));
    this.handle(ChannelType.IPC_DBCONNECTION_DELETE, async (_event: IpcMainEvent, name: string) => this.configManager.deleteDbConnection(name));

    this.handle(ChannelType.IPC_DBCONNECTION_TEST, async (_event: IpcMainEvent, args: any) => {
      const options = this.connectionManager.dataSource.options;
      if (options.database === args.database) {
        return this.connectionManager.isInitialized()
          .then(() => this.sendMessage('success', 'Connection tested successfully'))
          .catch((err: Error) => this.sendMessage('error', err.message));
      } else {
        return this.connectionManager.createDataSource(args)
          .then(() => this.sendMessage('success', 'Connection tested successfully'))
          .catch((err: Error) => this.sendMessage('error', err.message));
      }
    });

    this.handle(ChannelType.IPC_DATABASE_DROP, async (_event: IpcMainEvent) => this.connectionManager.getDataSource().dropDatabase());

    // Font Manager

    this.handle(ChannelType.IPC_EXEC_CMD, async (_event: IpcMainEvent, args: any) => this.fontManager.executeCommand(args).catch((err: Error) => this.sendMessage('error', err.message)));

    this.handle(ChannelType.IPC_AUTH_USER, async (_event: IpcMainEvent, args: any) => this.fontManager.systemAuthenticate(args));

    this.handle(ChannelType.IPC_SCAN_FILES, async (event: IpcMainEvent, args: any) => {
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

      return Promise.allSettled(promises);
    });

    this.handle(ChannelType.IPC_SCAN_FOLDERS, async (_event: IpcMainEvent, args: any) => {
      const promises = [];

      args.folders.forEach(async (sourceFolder: string) => {

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

      return Promise.allSettled(promises);
    });

    this.handle(ChannelType.IPC_ACTIVATE_FONT, async (_event: IpcMainEvent, args: any) => {
      this.fontManager.fontInstaller(args).catch((err: Error) => this.sendMessage('error', err.message));
    });

    this.handle(ChannelType.IPC_ACTIVATE_FOLDER, async (_event: IpcMainEvent, args: any) => {
      this.fontManager.folderInstaller(args).catch((err: Error) => this.sendMessage('error', err.message));
    });

    this.handle(ChannelType.IPC_FETCH_NEWS, async (_event: IpcMainEvent, args: any) => this.fontManager.fetchLatestNews(args));

    this.handle(ChannelType.IPC_SHOW_MESSAGE_BOX, async (_event: IpcMainEvent, options: any) => this.fontManager.showMessageBox(options));
    this.handle(ChannelType.IPC_SHOW_OPEN_DIALOG, async (_event: IpcMainEvent, options: any) => this.fontManager.showOpenDialog(options));
    this.handle(ChannelType.IPC_OPEN_PATH, async (_event: IpcMainEvent, path: string) => this.fontManager.openPath(path));
    this.handle(ChannelType.IPC_OPEN_FOLDER, async (_event: IpcMainEvent, fullPath: string) => this.fontManager.showItemInFolder(fullPath));
    this.handle(ChannelType.IPC_OPEN_EXTERNAL, async (_event: IpcMainEvent, url: string) => this.fontManager.openExternal(url));
    
    this.on(ChannelType.IPC_RELOAD_WINDOW, async (_event: IpcMainEvent) => this.fontManager.reLaunch());
    this.on(ChannelType.IPC_EXIT, async (_event: IpcMainEvent) => this.fontManager.exit());
    this.on(ChannelType.IPC_QUIT, async (_event: IpcMainEvent) => this.fontManager.quit());
    this.on(ChannelType.IPC_BEEP, async (_event: IpcMainEvent) => this.fontManager.beep());

    // Collection

    this.handle(ChannelType.IPC_COLLECTION_FIND, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getCollection().find(args);
    });

    this.handle(ChannelType.IPC_COLLECTION_FIND_ONE, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getCollectionRepository().findOne(args);
    });

    this.handle(ChannelType.IPC_COLLECTION_FIND_ONE_BY, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getCollectionRepository().findOneBy(args);
    });

    this.handle(ChannelType.IPC_COLLECTION_FETCH, async (_event: IpcMainEvent, args: any) => {
      return await this.fetchCollectionsWithCounts(args);
    });

    this.handle(ChannelType.IPC_COLLECTION_CREATE, async (_event: IpcMainEvent, args: any) => {
      await this.connectionManager.getCollectionRepository().createCollection(args);
      return await this.fetchCollectionsWithCounts(args);
    });

    this.handle(ChannelType.IPC_COLLECTION_UPDATE, async (_event: IpcMainEvent, args: any) => {
      await this.connectionManager.getCollectionRepository().updateCollection(args.collectionId, args.data);
      return await this.fetchCollectionsWithCounts(args);
    });

    this.handle(ChannelType.IPC_COLLECTION_DELETE, async (_event: IpcMainEvent, args: any) => {
      await this.connectionManager.getCollectionRepository().deleteCollection(args.collectionId);
      return await this.fetchCollectionsWithCounts(args);
    });

    this.handle(ChannelType.IPC_COLLECTION_UPDATE_IDS, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getCollectionRepository().updateCollectionIds(args.ids, args.data);
    });

    this.handle(ChannelType.IPC_COLLECTION_ENABLE, async (_event: IpcMainEvent, args: any) => {
      await this.connectionManager.getCollectionRepository().resetEnabled();
      await this.connectionManager.getCollectionRepository().updateCollection(args.collectionId, args.data);
      return await this.fetchCollectionsWithCounts(args);
    });

    this.handle(ChannelType.IPC_COLLECTION_UPDATE_COUNT, async (_event: IpcMainEvent, collectionId: number) => {
      const { total } = await this.connectionManager.getStoreRepository().fetchCollectionCount(collectionId);
      await this.connectionManager.getCollectionRepository().updateCollectionCount(collectionId, total);
      return await this.fetchCollectionsWithCounts({});
    });

    this.handle(ChannelType.IPC_COLLECTION_UPDATE_COUNTS, async (_event: IpcMainEvent) => {
      const items = await this.connectionManager.getStoreRepository().fetchCollectionsCount();
      await this.connectionManager.getCollectionRepository().updateCollectionCounts(items);
      return await this.fetchCollectionsWithCounts({});
    });

    // Store

    this.handle(ChannelType.IPC_STORE_FIND, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getStore().find(args);
    });

    this.handle(ChannelType.IPC_STORE_FIND_ONE, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getStoreRepository().findOne(args);
    });

    this.handle(ChannelType.IPC_STORE_FIND_ONE_BY, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getStoreRepository().findOneBy(args);
    });

    this.handle(ChannelType.IPC_STORE_FETCH, async (_event: IpcMainEvent, args: any) => {
      args.ids = [];
      if (args.collectionId) {
        const row: Collection = await this.connectionManager.getCollectionRepository().findOneBy({ id: args.collectionId });
        if (row) {
          const children = await this.connectionManager.getCollectionRepository().fetchChildren(row, true, false);
          if (Array.isArray(children)) {
            args.ids = Object.keys(children).map(val => children[val].id);
          }
        }
      }
      return await this.connectionManager.getStoreRepository().fetch(args);
    });

    this.handle(ChannelType.IPC_STORE_SEARCH, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getStoreRepository().search(args);
    });

    this.handle(ChannelType.IPC_STORE_UPDATE, async (_event: IpcMainEvent, args: any) => {
      await this.connectionManager.getStoreRepository().update(args.id, args.data);
      return await this.connectionManager.getStoreRepository().findOne({ where: { id: args.id } });
    });

    this.handle(ChannelType.IPC_STORE_SYNC_SYSTEM, async (_event: IpcMainEvent) => {
      await this.connectionManager.getStoreRepository().resetSystem();
      const row: Collection = await this.connectionManager.getCollectionRepository().findOneBy({ is_system: 1 });
      if (row) {
        const paths = this.systemManager.getPlatformFontPaths();
        const promises = [];
        paths.forEach(async (folder: string) => {
          promises.push(this.fontManager.scanFolders(folder, { collection_id: row.id, system: 1 }).catch((err: Error) => AppLogger.getInstance().error(err)));
        });
        Promise.allSettled(promises).then(async () => {
          return await this.connectionManager.getStoreRepository().fetchSystemStats();
        });
      }
    });

    this.handle(ChannelType.IPC_STORE_SYNC_ACTIVATED, async (_event: IpcMainEvent) => {
      await this.connectionManager.getStoreRepository().resetActivated();
      await this.connectionManager.getStoreRepository().syncActivated();
      return await this.connectionManager.getStoreRepository().fetchSystemStats();
    });

    this.handle(ChannelType.IPC_STORE_RESET_FAVORITES, async (_event: IpcMainEvent) => {
      await this.connectionManager.getStoreRepository().resetFavorites();
      return await this.connectionManager.getStoreRepository().fetchSystemStats();
    });

    this.handle(ChannelType.IPC_STORE_SYSTEM_STATS, async (_event: IpcMainEvent) => {
      return await this.connectionManager.getStoreRepository().fetchSystemStats();
    });

    // Logger

    this.handle(ChannelType.IPC_LOGGER_FIND, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getLogger().find(args);
    });

    this.handle(ChannelType.IPC_LOGGER_FIND_ONE, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getLoggerRepository().findOne(args);
    });

    this.handle(ChannelType.IPC_LOGGER_FIND_ONE_BY, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getLoggerRepository().findOneBy(args);
    });

    this.handle(ChannelType.IPC_LOGGER_CREATE, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getLoggerRepository().saveData(args);
    });

    this.handle(ChannelType.IPC_LOGGER_DELETE, async (_event: IpcMainEvent, args: any) => {
      return await this.connectionManager.getLogger().delete(args.id);
    });

    this.handle(ChannelType.IPC_LOGGER_TRUNCATE, async (_event: IpcMainEvent) => {
      return await this.connectionManager.getLogger().clear();
    });
  }

  // Misc

  sendMessage(type: string, message: string) {
    return { type, message };
  }

  async initSystemCollection() {
    const row = await this.connectionManager.getCollectionRepository().findOneBy({ is_system: 1 });
    if (!row) {
      return await this.connectionManager.getCollectionRepository().createSystemCollection();
    }
    return true;
  }

  async fetchCollectionsWithRelations() {
    return await this.connectionManager.getCollection().find({
      relations: {
        stores: true,
      },
    }).catch((err: Error) => AppLogger.getInstance().info(err.message));
  }

  async fetchCollectionsWithCounts(args: any): Promise<Collection[]> {
    return await this.connectionManager.getCollectionRepository().fetchCollectionsWithCounts(args);
  }
}
