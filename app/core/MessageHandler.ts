import { ipcMain, IpcMainEvent } from "electron";

import SystemManager from "./SystemManager";
import ConfigManager from "./ConfigManager";
import ConnectionManager from "./ConnectionManager";
import FontManager from "./FontManager";

import * as channel from "../config/channel";

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

    // SYSTEM BOOT/RESET

    this.on(channel.IPCMAIN_SYSTEM_BOOT, async (event: IpcMainEvent) => {
      let config = this.getConfigManager().get();
      let system = this.getSystemManager().toArray();
      event.returnValue = {
        ...config,
        system: system
      };
    });

    this.on(channel.IPCMAIN_SYSTEM_RESET, async (event) => {
      event.returnValue = true; // @todo
    });

    // CONFIG MANAGER

    this.on(channel.IPCMAIN_REQUEST_SET_CONFIG, async (event, args: any) => {
      this.getConfigManager().set(args.key, args.values);
      event.sender.send(channel.IPCMAIN_RESPONSE_SET_CONFIG, args);
    });

    this.on(channel.IPCMAIN_REQUEST_GET_CONFIG, async (event, args: any) => {
      const saved = this.getConfigManager().get(args.key);
      event.sender.send(channel.IPCMAIN_RESPONSE_SET_CONFIG, saved);
    });

    // CONNECTION MANAGER

    this.on(channel.IPCMAIN_REQUEST_SAVE_DBCONNECTION, async (event, options: any) => {
      const connections = this.getConfigManager().get("database.connections");
      if (options.name === "default") {
        event.sender.send(channel.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, connections);
      } else {
        connections.push(options);
        this.getConfigManager().set("database.connections", connections);
        event.sender.send(channel.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, this.getConfigManager().get("database.connections"));
      }
    });

    this.on(channel.IPCMAIN_REQUEST_DELETE_DBCONNECTION, async (event, name: string) => {
      const connections = this.getConfigManager().get("database.connections");
      if (name === "default") {
        event.sender.send(channel.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, connections);
      } else {
        for (var i in connections) {
          if (connections[i]["name"] == name) {
            connections.splice(i, 1);
          }
        }
        this.getConfigManager().set("database.connections", connections);
        event.sender.send(channel.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, connections);
      }
    });

    this.on(channel.IPCMAIN_REQUEST_ENABLE_DBCONNECTION, (event, item) => {
      this.getConfigManager().enableDbConnection(item);
      event.returnValue = item;
    });

    this.on(channel.IPCMAIN_REQUEST_TEST_CONNECTION, async (event, args: any) => {
      let activeConnectionOptions = this.getConnectionManager().dataSource.options;
      if (activeConnectionOptions.database === args.database) {
        this.getConnectionManager().isInitialized().then(() => {
          event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: "success", message: "Connection tested successfully" });
        }).catch((err) => {
          event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: "error", message: err.message });
        });
      } else {
        this.getConnectionManager().createDataSourceWithOptions(args).then(() => {
          event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: "success", message: "Connection tested successfully" });
        }).catch((err) => {
          event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: "error", message: err.message });
        });
      }
    });

    // FONT MANAGER

    this.on(channel.IPCMAIN_REQUEST_EXECUTE_COMMAND, async (event, args: any) => {
      await this.getFontManager().executeCommand(args).then((response) => {
        event.sender.send(channel.IPCMAIN_RESPONSE_EXECUTE_COMMAND, response);
      }).catch((err) => event.sender.send(channel.IPCMAIN_RESPONSE_EXECUTE_COMMAND, err.message));
    });

    this.on(channel.IPCMAIN_REQUEST_FILES_SCAN, async (event, args: any) => {
      this.getFontManager().scanFiles(args.paths, { collection_id: args.collectionId }, async () => {
        let find = await this.getConnectionManager().getStore().find({ order: { id: "DESC" }, skip: 0, take: 100 });
        event.sender.send(channel.IPCMAIN_RESPONSE_FILES_SCAN, find);
      });
    });

    this.on(channel.IPCMAIN_REQUEST_FOLDERS_SCAN, async (event, args: any) => {
      this.getFontManager().scanFolders(args.paths[0], { collection_id: args.collectionId }, async () => {
        let find = await this.getConnectionManager().getStore().find({ order: { id: "DESC" }, skip: 0, take: 100 });
        event.sender.send(channel.IPCMAIN_RESPONSE_FOLDERS_SCAN, find);
      });
    });

    this.on(channel.IPCMAIN_REQUEST_FONT_ACTIVATION, async (event, args: any) => { });

    this.on(channel.IPCMAIN_REQUEST_SHOW_MESSAGE_BOX, async (event, options: any) => {
      this.getFontManager().showDialogBox(options).then((response: any) => event.sender.send(channel.IPCMAIN_RESPONSE_SHOW_MESSAGE_BOX, response));
    });

    this.on(channel.IPCMAIN_REQUEST_SHOW_OPEN_DIALOG, async (event, options: any) => {
      this.getFontManager().showOpenDialog(options).then((response: any) => event.sender.send(channel.IPCMAIN_RESPONSE_SHOW_OPEN_DIALOG, response));
    });

    this.on(channel.IPCMAIN_REQUEST_OPEN_PATH, async (event, path: string) => {
      this.getFontManager().openPath(path);
    });

    this.on(channel.IPCMAIN_REQUEST_SHOW_ITEM_FOLDER, async (event, fullPath: string) => {
      this.getFontManager().showItemInFolder(fullPath);
    });

    this.on(channel.IPCMAIN_REQUEST_OPEN_EXTERNAL, async (event, url: string) => {
      this.getFontManager().openExternal(url);
    });

    this.on(channel.IPCMAIN_REQUEST_RELOAD_WINDOW, async (event) => {
      this.getFontManager().reloadWindow();
    });

    // COLLECTION

    this.on(channel.IPCMAIN_REQUEST_FETCH_COLLECTIONS, async (event, ...args: any[]) => {
      event.returnValue = await this.getConnectionManager().getCollection().find(...args);
    });

    this.on(channel.IPCMAIN_REQUEST_CREATE_COLLECTION, async (event, parentId: number) => {
      await this.getConnectionManager().getCollectionRepository().createCollection(parentId);
      event.returnValue = await this.getConnectionManager().getCollection().find();
    });

    this.on(channel.IPCMAIN_REQUEST_DELETE_COLLECTION, async (event: any, collectionId: number) => {
      await this.getConnectionManager().getCollectionRepository().deleteCollection(collectionId);
      await this.getConnectionManager().getStoreRepository().deleteCollection(collectionId);
      event.returnValue = await this.getConnectionManager().getCollection().find();
    });

    this.on(channel.IPCMAIN_REQUEST_UPDATE_COLLECTION, async (event: any, args: any) => {
      await this.getConnectionManager().getCollectionRepository().updateCollection(args);
      let find = await this.getConnectionManager().getCollection().find();
      event.sender.send(channel.IPCMAIN_RESPONSE_UPDATE_COLLECTION, find);
    });

    this.on(channel.IPCMAIN_REQUEST_RESET_ENABLED, async (event: any) => {
      await this.getConnectionManager().getCollectionRepository().resetEnabled();
      let find = await this.getConnectionManager().getCollection().find();
      event.sender.send(channel.IPCMAIN_RESPONSE_RESET_ENABLED, find);
    });

    // STORE

    this.on(channel.IPCMAIN_REQUEST_STORE_QUERY, async (event, args: any) => {
      let [results, total] = await this.getConnectionManager().getStoreRepository().fetchStore(args);
      event.sender.send(channel.IPCMAIN_RESPONSE_STORE_QUERY, [total, results]);
    });

    this.on(channel.IPCMAIN_REQUEST_FONT_INFORMATION, async (event, storeId: number) => {
      const result = await this.getConnectionManager().getStoreRepository().findOne({ where: { id: storeId } });
      event.sender.send(channel.IPCMAIN_RESPONSE_FONT_INFORMATION, result);
    });

    this.on(channel.IPCMAIN_REQUEST_UPDATE_STORE, async (event: any, data) => {
      await this.getConnectionManager().getStoreRepository().updateStore(data);
      event.returnValue = await this.getConnectionManager().getCollection().find();
    });

    this.on(channel.IPCMAIN_REQUEST_UPDATE_COUNT, async (event: any, collectionId: number) => {
      const { total } = await this.getConnectionManager().getStoreRepository().fetchCollectionCount(collectionId);
      await this.getConnectionManager().getCollectionRepository().updateCollectionCount(collectionId, total);
      event.returnValue = await this.getConnectionManager().getCollection().find();
    });

    this.on(channel.IPCMAIN_REQUEST_UPDATE_COUNTS, async (event: any) => {
      const items = await this.getConnectionManager().getStoreRepository().fetchCollectionsCount();
      await this.getConnectionManager().getCollectionRepository().updateCollectionCounts(items);
      event.returnValue = await this.getConnectionManager().getCollection().find();
    });

    this.on(channel.IPCMAIN_REQUEST_SYSTEM_FONTS, async (event) => {
      await this.getConnectionManager().getStoreRepository().resetSystemFonts();
      const path = this.getSystemManager().getSystemFontsPath();
      this.getFontManager().scanFolders(path, { collection_id: 0, system: 1 }, async () => {
        const results = await this.getConnectionManager().getStoreRepository().fetchSystemStats();
        event.sender.send(channel.IPCMAIN_RESPONSE_SYSTEM_FONTS, results);
      });
    });

    this.on(channel.IPCMAIN_REQUEST_ACTIVATED_FONTS, async (event) => {
      let results = await this.getConnectionManager().getStore().createQueryBuilder().where("store.activated = 1").getMany();
      event.sender.send(channel.IPCMAIN_RESPONSE_ACTIVATED_FONTS, results)
    });

    this.on(channel.IPCMAIN_REQUEST_RESET_FAVORITES, async (event) => {
      const results = await this.getConnectionManager().getStoreRepository().resetFavorites();
      event.sender.send(channel.IPCMAIN_RESPONSE_RESET_FAVORITES, results);
    });

    this.on(channel.IPCMAIN_REQUEST_RESET_ACTIVATED, async (event) => {
      const results = await this.getConnectionManager().getStoreRepository().resetActivated();
      event.sender.send(channel.IPCMAIN_REQUEST_RESET_ACTIVATED, results);
    });

    this.on(channel.IPCMAIN_REQUEST_SYSTEM_STATS, async (event) => {
      const results = await this.getConnectionManager().getStoreRepository().fetchSystemStats();
      event.sender.send(channel.IPCMAIN_RESPONSE_SYSTEM_STATS, results);
    });

    // LOGGER 

    this.on(channel.IPCMAIN_REQUEST_LOGGER_CREATE, async (event: any, data: any) => {
      event.returnValue = await this.getConnectionManager().getLoggerRepository().log(data);
    });

    this.on(channel.IPCMAIN_REQUEST_LOGGER_QUERY, async (event, args: any) => {
      let find = await this.getConnectionManager().getLogger().find({ order: { id: "DESC" }, skip: 0, take: 100 });
      event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_QUERY, find);
    });

    this.on(channel.IPCMAIN_REQUEST_LOGGER_DELETE_ITEM, async (event, args: any) => {
      await this.getConnectionManager().getLogger().delete(args.id);
      event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_DELETE_ITEM, args);
    });

    this.on(channel.IPCMAIN_REQUEST_LOGGER_TRUNCATE, async (event, args: any) => {
      await this.getConnectionManager().getLogger().clear();
      event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_TRUNCATE, args);
    });

  }
}