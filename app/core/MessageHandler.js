"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const channel = require("../config/channel");
class MessageHandler {
    constructor(systemManager, configManager, connectionManager, fontManager) {
        this.setSystemManager(systemManager);
        this.setConfigManager(configManager);
        this.setConnectionManager(connectionManager);
        this.setFontManager(fontManager);
    }
    setSystemManager(systemManager) {
        this.systemManager = systemManager;
    }
    getSystemManager() {
        return this.systemManager;
    }
    setConfigManager(configManager) {
        this.configManager = configManager;
    }
    getConfigManager() {
        return this.configManager;
    }
    setConnectionManager(connectionManager) {
        this.connectionManager = connectionManager;
    }
    getConnectionManager() {
        return this.connectionManager;
    }
    setFontManager(fontManager) {
        this.fontManager = fontManager;
    }
    getFontManager() {
        return this.fontManager;
    }
    on(channel, done) {
        return electron_1.ipcMain.on(channel, done);
    }
    initialize() {
        // SYSTEM BOOT/RESET
        this.on(channel.IPCMAIN_SYSTEM_BOOT, (event) => __awaiter(this, void 0, void 0, function* () {
            let config = this.getConfigManager().get();
            let system = this.getSystemManager().toArray();
            event.returnValue = Object.assign(Object.assign({}, config), { system: system });
        }));
        this.on(channel.IPCMAIN_SYSTEM_RESET, (event) => __awaiter(this, void 0, void 0, function* () {
            event.returnValue = true; // @todo
        }));
        // CONFIG MANAGER
        this.on(channel.IPCMAIN_REQUEST_SET_CONFIG, (event, args) => __awaiter(this, void 0, void 0, function* () {
            this.getConfigManager().set(args.key, args.values);
            event.sender.send(channel.IPCMAIN_RESPONSE_SET_CONFIG, args);
        }));
        this.on(channel.IPCMAIN_REQUEST_GET_CONFIG, (event, args) => __awaiter(this, void 0, void 0, function* () {
            const saved = this.getConfigManager().get(args.key);
            event.sender.send(channel.IPCMAIN_RESPONSE_SET_CONFIG, saved);
        }));
        // CONNECTION MANAGER
        this.on(channel.IPCMAIN_REQUEST_SAVE_DBCONNECTION, (event, options) => __awaiter(this, void 0, void 0, function* () {
            const connections = this.getConfigManager().get("database.connections");
            if (options.name === "default") {
                event.sender.send(channel.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, connections);
            }
            else {
                connections.push(options);
                this.getConfigManager().set("database.connections", connections);
                event.sender.send(channel.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, this.getConfigManager().get("database.connections"));
            }
        }));
        this.on(channel.IPCMAIN_REQUEST_DELETE_DBCONNECTION, (event, name) => __awaiter(this, void 0, void 0, function* () {
            const connections = this.getConfigManager().get("database.connections");
            if (name === "default") {
                event.sender.send(channel.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, connections);
            }
            else {
                for (var i in connections) {
                    if (connections[i]["name"] == name) {
                        connections.splice(i, 1);
                    }
                }
                this.getConfigManager().set("database.connections", connections);
                event.sender.send(channel.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, connections);
            }
        }));
        this.on(channel.IPCMAIN_REQUEST_ENABLE_DBCONNECTION, (event, item) => {
            this.getConfigManager().enableDbConnection(item);
            event.returnValue = item;
        });
        this.on(channel.IPCMAIN_REQUEST_TEST_CONNECTION, (event, args) => __awaiter(this, void 0, void 0, function* () {
            let activeConnectionOptions = this.getConnectionManager().dataSource.options;
            if (activeConnectionOptions.database === args.database) {
                this.getConnectionManager().isInitialized().then(() => {
                    event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: "success", message: "Connection tested successfully" });
                }).catch((err) => {
                    event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: "error", message: err.message });
                });
            }
            else {
                this.getConnectionManager().createDataSourceWithOptions(args).then(() => {
                    event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: "success", message: "Connection tested successfully" });
                }).catch((err) => {
                    event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: "error", message: err.message });
                });
            }
        }));
        // FONT MANAGER
        this.on(channel.IPCMAIN_REQUEST_EXECUTE_COMMAND, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.getFontManager().executeCommand(args).then((response) => {
                event.sender.send(channel.IPCMAIN_RESPONSE_EXECUTE_COMMAND, response);
            }).catch((err) => event.sender.send(channel.IPCMAIN_RESPONSE_EXECUTE_COMMAND, err.message));
        }));
        this.on(channel.IPCMAIN_REQUEST_FILES_SCAN, (event, args) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().scanFiles(args.paths, { collection_id: args.collectionId }, () => __awaiter(this, void 0, void 0, function* () {
                let find = yield this.getConnectionManager().getStore().find({ order: { id: "DESC" }, skip: 0, take: 100 });
                event.sender.send(channel.IPCMAIN_RESPONSE_FILES_SCAN, find);
            }));
        }));
        this.on(channel.IPCMAIN_REQUEST_FOLDERS_SCAN, (event, args) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().scanFolders(args.paths[0], { collection_id: args.collectionId }, () => __awaiter(this, void 0, void 0, function* () {
                let find = yield this.getConnectionManager().getStore().find({ order: { id: "DESC" }, skip: 0, take: 100 });
                event.sender.send(channel.IPCMAIN_RESPONSE_FOLDERS_SCAN, find);
            }));
        }));
        this.on(channel.IPCMAIN_REQUEST_FONT_ACTIVATION, (event, args) => __awaiter(this, void 0, void 0, function* () { }));
        this.on(channel.IPCMAIN_REQUEST_SHOW_MESSAGE_BOX, (event, options) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().showDialogBox(options).then((response) => event.sender.send(channel.IPCMAIN_RESPONSE_SHOW_MESSAGE_BOX, response));
        }));
        this.on(channel.IPCMAIN_REQUEST_SHOW_OPEN_DIALOG, (event, options) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().showOpenDialog(options).then((response) => event.sender.send(channel.IPCMAIN_RESPONSE_SHOW_OPEN_DIALOG, response));
        }));
        this.on(channel.IPCMAIN_REQUEST_OPEN_PATH, (event, path) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().openPath(path);
        }));
        this.on(channel.IPCMAIN_REQUEST_SHOW_ITEM_FOLDER, (event, fullPath) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().showItemInFolder(fullPath);
        }));
        this.on(channel.IPCMAIN_REQUEST_OPEN_EXTERNAL, (event, url) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().openExternal(url);
        }));
        this.on(channel.IPCMAIN_REQUEST_RELOAD_WINDOW, (event) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().reloadWindow();
        }));
        // COLLECTION
        this.on(channel.IPCMAIN_REQUEST_FETCH_COLLECTIONS, (event, ...args) => __awaiter(this, void 0, void 0, function* () {
            event.returnValue = yield this.getConnectionManager().getCollection().find(...args);
        }));
        this.on(channel.IPCMAIN_REQUEST_CREATE_COLLECTION, (event, parentId) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getCollectionRepository().createCollection(parentId);
            event.returnValue = yield this.getConnectionManager().getCollection().find();
        }));
        this.on(channel.IPCMAIN_REQUEST_DELETE_COLLECTION, (event, collectionId) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getCollectionRepository().deleteCollection(collectionId);
            yield this.getConnectionManager().getStoreRepository().deleteCollection(collectionId);
            event.returnValue = yield this.getConnectionManager().getCollection().find();
        }));
        this.on(channel.IPCMAIN_REQUEST_UPDATE_COLLECTION, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getCollectionRepository().updateCollection(args);
            let find = yield this.getConnectionManager().getCollection().find();
            event.sender.send(channel.IPCMAIN_RESPONSE_UPDATE_COLLECTION, find);
        }));
        this.on(channel.IPCMAIN_REQUEST_RESET_ENABLED, (event) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getCollectionRepository().resetEnabled();
            let find = yield this.getConnectionManager().getCollection().find();
            event.sender.send(channel.IPCMAIN_RESPONSE_RESET_ENABLED, find);
        }));
        // STORE
        this.on(channel.IPCMAIN_REQUEST_STORE_QUERY, (event, args) => __awaiter(this, void 0, void 0, function* () {
            let [results, total] = yield this.getConnectionManager().getStoreRepository().fetchStore(args);
            event.sender.send(channel.IPCMAIN_RESPONSE_STORE_QUERY, [total, results]);
        }));
        this.on(channel.IPCMAIN_REQUEST_FONT_INFORMATION, (event, storeId) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.getConnectionManager().getStoreRepository().findOne({ where: { id: storeId } });
            event.sender.send(channel.IPCMAIN_RESPONSE_FONT_INFORMATION, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_UPDATE_STORE, (event, data) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getStoreRepository().updateStore(data);
            event.returnValue = yield this.getConnectionManager().getCollection().find();
        }));
        this.on(channel.IPCMAIN_REQUEST_UPDATE_COUNT, (event, collectionId) => __awaiter(this, void 0, void 0, function* () {
            const { total } = yield this.getConnectionManager().getStoreRepository().fetchCollectionCount(collectionId);
            yield this.getConnectionManager().getCollectionRepository().updateCollectionCount(collectionId, total);
            event.returnValue = yield this.getConnectionManager().getCollection().find();
        }));
        this.on(channel.IPCMAIN_REQUEST_UPDATE_COUNTS, (event) => __awaiter(this, void 0, void 0, function* () {
            const items = yield this.getConnectionManager().getStoreRepository().fetchCollectionsCount();
            yield this.getConnectionManager().getCollectionRepository().updateCollectionCounts(items);
            event.returnValue = yield this.getConnectionManager().getCollection().find();
        }));
        this.on(channel.IPCMAIN_REQUEST_SYSTEM_FONTS, (event) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getStoreRepository().resetSystemFonts();
            const path = this.getSystemManager().getSystemFontsPath();
            this.getFontManager().scanFolders(path, { collection_id: 0, system: 1 }, () => __awaiter(this, void 0, void 0, function* () {
                const results = yield this.getConnectionManager().getStoreRepository().fetchSystemStats();
                event.sender.send(channel.IPCMAIN_RESPONSE_SYSTEM_FONTS, results);
            }));
        }));
        this.on(channel.IPCMAIN_REQUEST_ACTIVATED_FONTS, (event) => __awaiter(this, void 0, void 0, function* () {
            let results = yield this.getConnectionManager().getStore().createQueryBuilder().where("store.activated = 1").getMany();
            event.sender.send(channel.IPCMAIN_RESPONSE_ACTIVATED_FONTS, results);
        }));
        this.on(channel.IPCMAIN_REQUEST_RESET_FAVORITES, (event) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.getConnectionManager().getStoreRepository().resetFavorites();
            event.sender.send(channel.IPCMAIN_RESPONSE_RESET_FAVORITES, results);
        }));
        this.on(channel.IPCMAIN_REQUEST_RESET_ACTIVATED, (event) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.getConnectionManager().getStoreRepository().resetActivated();
            event.sender.send(channel.IPCMAIN_REQUEST_RESET_ACTIVATED, results);
        }));
        this.on(channel.IPCMAIN_REQUEST_SYSTEM_STATS, (event) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.getConnectionManager().getStoreRepository().fetchSystemStats();
            event.sender.send(channel.IPCMAIN_RESPONSE_SYSTEM_STATS, results);
        }));
        // LOGGER 
        this.on(channel.IPCMAIN_REQUEST_LOGGER_CREATE, (event, data) => __awaiter(this, void 0, void 0, function* () {
            event.returnValue = yield this.getConnectionManager().getLoggerRepository().log(data);
        }));
        this.on(channel.IPCMAIN_REQUEST_LOGGER_QUERY, (event, args) => __awaiter(this, void 0, void 0, function* () {
            let find = yield this.getConnectionManager().getLogger().find({ order: { id: "DESC" }, skip: 0, take: 100 });
            event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_QUERY, find);
        }));
        this.on(channel.IPCMAIN_REQUEST_LOGGER_DELETE_ITEM, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getLogger().delete(args.id);
            event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_DELETE_ITEM, args);
        }));
        this.on(channel.IPCMAIN_REQUEST_LOGGER_TRUNCATE, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getLogger().clear();
            event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_TRUNCATE, args);
        }));
    }
}
exports.default = MessageHandler;
//# sourceMappingURL=MessageHandler.js.map