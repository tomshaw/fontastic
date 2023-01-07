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
const AppLogger_1 = require("./AppLogger");
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
        this.on(channel.IPCMAIN_REQUEST_SYSTEM_BOOT, (event, args) => __awaiter(this, void 0, void 0, function* () {
            let config = this.getConfigManager().get();
            let system = this.getSystemManager().toArray();
            const response = Object.assign(Object.assign({}, config), { system: system });
            event.sender.send(channel.IPCMAIN_RESPONSE_SYSTEM_BOOT, response);
        }));
        this.on(channel.IPCMAIN_REQUEST_SYSTEM_RESET, (event, args) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().reLaunch();
            event.sender.send(channel.IPCMAIN_RESPONSE_SYSTEM_RESET, {});
        }));
        /**
         * Config Manager
         */
        this.on(channel.IPCMAIN_REQUEST_SET_CONFIG, (event, args) => __awaiter(this, void 0, void 0, function* () {
            this.getConfigManager().set(args.key, args.values);
            event.sender.send(channel.IPCMAIN_RESPONSE_SET_CONFIG, args);
        }));
        this.on(channel.IPCMAIN_REQUEST_GET_CONFIG, (event, args) => __awaiter(this, void 0, void 0, function* () {
            const saved = this.getConfigManager().get(args.key);
            event.sender.send(channel.IPCMAIN_RESPONSE_SET_CONFIG, saved);
        }));
        this.on(channel.IPCMAIN_REQUEST_CLEAR_STORE, (event) => __awaiter(this, void 0, void 0, function* () {
            const response = this.getConfigManager().clear();
            event.sender.send(channel.IPCMAIN_RESPONSE_CLEAR_STORE, response);
        }));
        /**
         * Connection Manager
         */
        this.on(channel.IPCMAIN_REQUEST_SAVE_DBCONNECTION, (event, options) => __awaiter(this, void 0, void 0, function* () {
            if (options.name === 'default') {
                event.sender.send(channel.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, this.getConfigManager().get('database').connections);
            }
            else {
                this.getConfigManager().saveDbConnection(options);
                event.sender.send(channel.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, this.getConfigManager().get('database').connections);
            }
        }));
        this.on(channel.IPCMAIN_REQUEST_DELETE_DBCONNECTION, (event, name) => __awaiter(this, void 0, void 0, function* () {
            if (name === 'default') {
                event.sender.send(channel.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, this.getConfigManager().get('database').connections);
            }
            else {
                this.getConfigManager().deleteDbConnection(name);
                event.sender.send(channel.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, this.getConfigManager().get('database').connections);
            }
        }));
        this.on(channel.IPCMAIN_REQUEST_ENABLE_DBCONNECTION, (event, item) => {
            this.getConfigManager().enableDbConnection(item);
            event.sender.send(channel.IPCMAIN_RESPONSE_ENABLE_DBCONNECTION, item);
        });
        this.on(channel.IPCMAIN_REQUEST_TEST_CONNECTION, (event, args) => __awaiter(this, void 0, void 0, function* () {
            let activeConnectionOptions = this.getConnectionManager().dataSource.options;
            if (activeConnectionOptions.database === args.database) {
                this.getConnectionManager().isInitialized().then(() => {
                    event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'success', message: 'Connection tested successfully' });
                }).catch((err) => {
                    event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'error', message: err.message });
                });
            }
            else {
                this.getConnectionManager().createDataSourceWithOptions(args).then(() => {
                    event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'success', message: 'Connection tested successfully' });
                }).catch((err) => {
                    event.sender.send(channel.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'error', message: err.message });
                });
            }
        }));
        this.on(channel.IPCMAIN_REQUEST_DROP_DATABASE, (event) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().dropDatabase().then(() => {
                event.sender.send(channel.IPCMAIN_RESPONSE_DROP_DATABASE, { type: 'IPCMAIN_RESPONSE_DROP_DATABASE' });
            });
        }));
        /**
         * Font Manager
         */
        this.on(channel.IPCMAIN_REQUEST_EXECUTE_COMMAND, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.getFontManager().executeCommand(args).then((response) => {
                event.sender.send(channel.IPCMAIN_RESPONSE_EXECUTE_COMMAND, response);
            }).catch((err) => event.sender.send(channel.IPCMAIN_RESPONSE_EXECUTE_COMMAND, err.message));
        }));
        this.on(channel.IPCMAIN_REQUEST_FILES_SCAN, (event, args) => __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            const addToCatalog = () => __awaiter(this, void 0, void 0, function* () {
                const dest = this.getFontManager().getDestinationFolder();
                yield this.getFontManager().createCatalog(dest);
                yield this.getFontManager().copyFiles(args.files, dest);
                const files = this.getFontManager().getMapFilePaths(args.files, dest);
                yield this.getFontManager().scanFiles(files, { collection_id: args.collectionId });
            });
            const addInPlace = () => __awaiter(this, void 0, void 0, function* () {
                yield this.getFontManager().scanFiles(args.files, { collection_id: args.collectionId });
            });
            if (args.addToCatalog) {
                promises.push(addToCatalog());
            }
            else {
                promises.push(addInPlace());
            }
            Promise.allSettled(promises).then(() => __awaiter(this, void 0, void 0, function* () {
                const result = yield this.fetchStore();
                event.sender.send(channel.IPCMAIN_RESPONSE_FILES_SCAN, result);
            }));
        }));
        this.on(channel.IPCMAIN_REQUEST_FOLDERS_SCAN, (event, args) => __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            args.folders.forEach((sourceFolder, i) => __awaiter(this, void 0, void 0, function* () {
                const addToCatalog = () => __awaiter(this, void 0, void 0, function* () {
                    const folders = this.getFontManager().getSourceDestinationFolders(sourceFolder);
                    yield this.getFontManager().createCatalog(folders.dest);
                    yield this.getFontManager().copyFolders(folders.src, folders.dest);
                    yield this.getFontManager().scanFolders(folders.dest, { collection_id: args.collectionId });
                });
                const addInPlace = () => __awaiter(this, void 0, void 0, function* () {
                    yield this.getFontManager().scanFolders(sourceFolder, { collection_id: args.collectionId });
                });
                if (args.addToCatalog) {
                    promises.push(addToCatalog());
                }
                else {
                    promises.push(addInPlace());
                }
            }));
            Promise.allSettled(promises).then(() => __awaiter(this, void 0, void 0, function* () {
                const result = yield this.fetchStore();
                event.sender.send(channel.IPCMAIN_RESPONSE_FOLDERS_SCAN, result);
            }));
        }));
        this.on(channel.IPCMAIN_REQUEST_FONT_ACTIVATION, (event, args) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().fontInstaller(args).then((response) => __awaiter(this, void 0, void 0, function* () {
                AppLogger_1.default.getInstance().info(response);
                const result = yield this.fetchStore();
                event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, result);
            })).catch((err) => event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, err.message));
        }));
        this.on(channel.IPCMAIN_REQUEST_AUTH_USER, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.getFontManager().systemAuthenticate(args).then((response) => {
                event.sender.send(channel.IPCMAIN_RESPONSE_AUTH_USER, response);
            });
        }));
        this.on(channel.IPCMAIN_REQUEST_FETCH_NEWS, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.getFontManager().fetchLatestNews(args).then((response) => {
                event.sender.send(channel.IPCMAIN_RESPONSE_FETCH_NEWS, response);
            });
        }));
        this.on(channel.IPCMAIN_REQUEST_NEWS_CONTENT, (event, url) => __awaiter(this, void 0, void 0, function* () {
            yield this.getFontManager().fetchNewsContent(url).then((response) => {
                event.sender.send(channel.IPCMAIN_RESPONSE_NEWS_CONTENT, response);
            });
        }));
        this.on(channel.IPCMAIN_REQUEST_MESSAGE_BOX, (event, options) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().showDialogBox(options).then((response) => event.sender.send(channel.IPCMAIN_RESPONSE_MESSAGE_BOX, response));
        }));
        this.on(channel.IPCMAIN_REQUEST_OPEN_DIALOG, (event, options) => __awaiter(this, void 0, void 0, function* () {
            this.getFontManager().showOpenDialog(options).then((response) => event.sender.send(channel.IPCMAIN_RESPONSE_OPEN_DIALOG, response));
        }));
        this.on(channel.IPCMAIN_REQUEST_OPEN_PATH, (event, path) => __awaiter(this, void 0, void 0, function* () { return this.getFontManager().openPath(path); }));
        this.on(channel.IPCMAIN_REQUEST_OPEN_FOLDER, (event, fullPath) => __awaiter(this, void 0, void 0, function* () { return this.getFontManager().showItemInFolder(fullPath); }));
        this.on(channel.IPCMAIN_REQUEST_OPEN_EXTERNAL, (event, url) => __awaiter(this, void 0, void 0, function* () { return this.getFontManager().openExternal(url); }));
        this.on(channel.IPCMAIN_REQUEST_RELOAD_WINDOW, (event) => __awaiter(this, void 0, void 0, function* () { return this.getFontManager().reLaunch(); }));
        this.on(channel.IPCMAIN_REQUEST_EXIT, (event) => __awaiter(this, void 0, void 0, function* () { return this.getFontManager().exit(); }));
        this.on(channel.IPCMAIN_REQUEST_QUIT, (event) => __awaiter(this, void 0, void 0, function* () { return this.getFontManager().quit(); }));
        this.on(channel.IPCMAIN_REQUEST_BEEP, (event) => __awaiter(this, void 0, void 0, function* () { return this.getFontManager().beep(); }));
        /**
         * Collection
         */
        this.on(channel.IPCMAIN_REQUEST_FETCH_COLLECTIONS, (event, ...args) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.getConnectionManager().getCollection().find(...args);
            event.sender.send(channel.IPCMAIN_RESPONSE_FETCH_COLLECTIONS, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_CREATE_COLLECTION, (event, parentId) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getCollectionRepository().createCollection(parentId);
            const result = yield this.getConnectionManager().getCollection().find();
            event.sender.send(channel.IPCMAIN_RESPONSE_CREATE_COLLECTION, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_DELETE_COLLECTION, (event, collectionId) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getCollectionRepository().deleteCollection(collectionId);
            yield this.getConnectionManager().getStoreRepository().deleteCollection(collectionId);
            const result = yield this.getConnectionManager().getCollection().find();
            event.sender.send(channel.IPCMAIN_RESPONSE_DELETE_COLLECTION, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_UPDATE_COLLECTION, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getCollectionRepository().updateCollection(args);
            const result = yield this.getConnectionManager().getCollection().find();
            event.sender.send(channel.IPCMAIN_RESPONSE_UPDATE_COLLECTION, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_RESET_ENABLED, (event) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getCollectionRepository().resetEnabled();
            const result = yield this.getConnectionManager().getCollection().find();
            event.sender.send(channel.IPCMAIN_RESPONSE_RESET_ENABLED, result);
        }));
        /**
         * Store
         */
        this.on(channel.IPCMAIN_REQUEST_STORE_FETCH_ALL, (event, args) => __awaiter(this, void 0, void 0, function* () {
            let [results, total] = (args.search) ?
                yield this.getConnectionManager().getStoreRepository().search(args) :
                yield this.getConnectionManager().getStoreRepository().fetch(args);
            event.sender.send(channel.IPCMAIN_RESPONSE_STORE_FETCH_ALL, [total, results]);
        }));
        this.on(channel.IPCMAIN_REQUEST_STORE_FETCH_ROW, (event, storeId) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.getConnectionManager().getStoreRepository().findOne({ where: { id: storeId } });
            event.sender.send(channel.IPCMAIN_RESPONSE_STORE_FETCH_ROW, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_STORE_UPDATE, (event, args) => __awaiter(this, void 0, void 0, function* () {
            let result = yield this.getConnectionManager().getStoreRepository().update(args.id, args.data);
            event.sender.send(channel.IPCMAIN_RESPONSE_STORE_UPDATE, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_UPDATE_COUNT, (event, collectionId) => __awaiter(this, void 0, void 0, function* () {
            const { total } = yield this.getConnectionManager().getStoreRepository().fetchCollectionCount(collectionId);
            yield this.getConnectionManager().getCollectionRepository().updateCollectionCount(collectionId, total);
            const result = yield this.getConnectionManager().getCollection().find();
            event.sender.send(channel.IPCMAIN_RESPONSE_UPDATE_COUNT, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_UPDATE_COUNTS, (event) => __awaiter(this, void 0, void 0, function* () {
            const items = yield this.getConnectionManager().getStoreRepository().fetchCollectionsCount();
            yield this.getConnectionManager().getCollectionRepository().updateCollectionCounts(items);
            const result = yield this.getConnectionManager().getCollection().find();
            event.sender.send(channel.IPCMAIN_RESPONSE_UPDATE_COUNTS, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_SYNC_SYSTEM, (event) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getStoreRepository().resetSystem();
            const paths = this.getSystemManager().getPlatformFontPaths();
            const promises = [];
            paths.forEach((path, i) => __awaiter(this, void 0, void 0, function* () {
                promises.push(this.getFontManager().scanFolders(path, { collection_id: 0, system: 1 }).catch((err) => {
                    AppLogger_1.default.getInstance().error(err);
                }));
            }));
            Promise.allSettled(promises).then(() => __awaiter(this, void 0, void 0, function* () {
                const result = yield this.getConnectionManager().getStoreRepository().fetchSystemStats();
                event.sender.send(channel.IPCMAIN_RESPONSE_SYNC_SYSTEM, result);
            }));
        }));
        this.on(channel.IPCMAIN_REQUEST_SYNC_ACTIVATED, (event) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getStoreRepository().resetActivated();
            yield this.getConnectionManager().getStoreRepository().syncActivated().then((result) => {
                event.sender.send(channel.IPCMAIN_RESPONSE_SYNC_ACTIVATED, result);
            });
        }));
        this.on(channel.IPCMAIN_REQUEST_RESET_FAVORITES, (event) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.getConnectionManager().getStoreRepository().resetFavorites();
            event.sender.send(channel.IPCMAIN_RESPONSE_RESET_FAVORITES, results);
        }));
        this.on(channel.IPCMAIN_REQUEST_SYSTEM_STATS, (event) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.getConnectionManager().getStoreRepository().fetchSystemStats();
            event.sender.send(channel.IPCMAIN_RESPONSE_SYSTEM_STATS, results);
        }));
        /**
         * Logger
         */
        this.on(channel.IPCMAIN_REQUEST_LOGGER_CREATE, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getLoggerRepository().log(args);
            const result = yield this.fetchLogger();
            event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_CREATE, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_LOGGER_QUERY, (event, args) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.fetchLogger();
            event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_QUERY, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_LOGGER_DELETE_ITEM, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getLogger().delete(args.id);
            const result = yield this.fetchLogger();
            event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_DELETE_ITEM, result);
        }));
        this.on(channel.IPCMAIN_REQUEST_LOGGER_TRUNCATE, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.getConnectionManager().getLogger().clear();
            const result = yield this.fetchLogger();
            event.sender.send(channel.IPCMAIN_RESPONSE_LOGGER_TRUNCATE, result);
        }));
    }
    fetchStore() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getConnectionManager().getStore().find({ order: { id: 'DESC' }, skip: 0, take: 100 });
        });
    }
    fetchLogger() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getConnectionManager().getLogger().find({ order: { id: 'DESC' }, skip: 0, take: 100 });
        });
    }
}
exports.default = MessageHandler;
//# sourceMappingURL=MessageHandler.js.map