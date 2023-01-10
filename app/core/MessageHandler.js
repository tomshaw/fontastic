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
const enums_1 = require("../enums");
class MessageHandler {
    constructor(systemManager, configManager, connectionManager, fontManager) {
        this.systemManager = systemManager;
        this.configManager = configManager;
        this.connectionManager = connectionManager;
        this.fontManager = fontManager;
    }
    on(channel, done) {
        return electron_1.ipcMain.on(channel, done);
    }
    send(event, channel, data) {
        event.sender.send(channel, data);
    }
    handle(channel, done) {
        return electron_1.ipcMain.handle(channel, done);
    }
    initialize() {
        this.handle(enums_1.ChannelType.IPCMAIN_SYSTEM_BOOT, (_event, _args) => __awaiter(this, void 0, void 0, function* () {
            let config = this.configManager.get();
            let system = this.systemManager.toArray();
            const response = Object.assign(Object.assign({}, config), { system: system });
            return response;
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_SYSTEM_RESET, (event, _args) => __awaiter(this, void 0, void 0, function* () {
            this.fontManager.reLaunch();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_SYSTEM_RESET, {});
        }));
        /**
         * Config Manager
         */
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_SET_CONFIG, (event, args) => __awaiter(this, void 0, void 0, function* () {
            this.configManager.set(args.key, args.values);
            const saved = this.configManager.get(args.key);
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_SET_CONFIG, saved);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_GET_CONFIG, (event, args) => __awaiter(this, void 0, void 0, function* () {
            const saved = this.configManager.get(args.key);
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_SET_CONFIG, saved);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_CLEAR_STORE, (event) => __awaiter(this, void 0, void 0, function* () {
            const response = this.configManager.clear();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_CLEAR_STORE, response);
        }));
        /**
         * Connection Manager
         */
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_SAVE_DBCONNECTION, (event, options) => __awaiter(this, void 0, void 0, function* () {
            if (options.name === 'default') {
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, this.configManager.get(enums_1.StorageType.DatabaseConnections));
            }
            else {
                this.configManager.saveDbConnection(options);
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_SAVE_DBCONNECTION, this.configManager.get(enums_1.StorageType.DatabaseConnections));
            }
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_DELETE_DBCONNECTION, (event, name) => __awaiter(this, void 0, void 0, function* () {
            if (name === 'default') {
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, this.configManager.get(enums_1.StorageType.DatabaseConnections));
            }
            else {
                this.configManager.deleteDbConnection(name);
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_DELETE_DBCONNECTION, this.configManager.get(enums_1.StorageType.DatabaseConnections));
            }
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_ENABLE_DBCONNECTION, (event, item) => {
            this.configManager.enableDbConnection(item);
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_ENABLE_DBCONNECTION, item);
        });
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_TEST_CONNECTION, (event, args) => __awaiter(this, void 0, void 0, function* () {
            let activeConnectionOptions = this.connectionManager.dataSource.options;
            if (activeConnectionOptions.database === args.database) {
                this.connectionManager.isInitialized().then(() => {
                    this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'success', message: 'Connection tested successfully' });
                }).catch((err) => {
                    this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'error', message: err.message });
                });
            }
            else {
                this.connectionManager.createDataSource(args).then(() => {
                    this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'success', message: 'Connection tested successfully' });
                }).catch((err) => {
                    this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_TEST_CONNECTION, { type: 'error', message: err.message });
                });
            }
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_DROP_DATABASE, (event) => __awaiter(this, void 0, void 0, function* () {
            this.connectionManager.dropDatabase().then(() => {
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_DROP_DATABASE, { type: 'success', message: 'Database droped successfully' });
            }).catch((err) => {
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_DROP_DATABASE, { type: 'error', message: err.message });
            });
        }));
        /**
         * Font Manager
         */
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_EXECUTE_COMMAND, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.fontManager.executeCommand(args).then((response) => {
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_EXECUTE_COMMAND, response);
            }).catch((err) => this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_EXECUTE_COMMAND, err.message));
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_FILES_SCAN, (event, args) => __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            const addToCatalog = () => __awaiter(this, void 0, void 0, function* () {
                const dest = this.fontManager.getDestinationFolder();
                yield this.fontManager.createCatalog(dest);
                yield this.fontManager.copyFiles(args.files, dest);
                const files = this.fontManager.getMapFilePaths(args.files, dest);
                yield this.fontManager.scanFiles(files, { collection_id: args.collectionId });
            });
            const addInPlace = () => __awaiter(this, void 0, void 0, function* () {
                yield this.fontManager.scanFiles(args.files, { collection_id: args.collectionId });
            });
            if (args.addToCatalog) {
                promises.push(addToCatalog());
            }
            else {
                promises.push(addInPlace());
            }
            Promise.allSettled(promises).then(() => __awaiter(this, void 0, void 0, function* () {
                const result = yield this.fetchStore();
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_FILES_SCAN, result);
            }));
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_FOLDERS_SCAN, (event, args) => __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            args.folders.forEach((sourceFolder, _i) => __awaiter(this, void 0, void 0, function* () {
                const addToCatalog = () => __awaiter(this, void 0, void 0, function* () {
                    const folders = this.fontManager.getSourceDestinationFolders(sourceFolder);
                    yield this.fontManager.createCatalog(folders.dest);
                    yield this.fontManager.copyFolders(folders.src, folders.dest);
                    yield this.fontManager.scanFolders(folders.dest, { collection_id: args.collectionId });
                });
                const addInPlace = () => __awaiter(this, void 0, void 0, function* () {
                    yield this.fontManager.scanFolders(sourceFolder, { collection_id: args.collectionId });
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
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_FOLDERS_SCAN, result);
            }));
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_FONT_ACTIVATION, (event, args) => __awaiter(this, void 0, void 0, function* () {
            this.fontManager.fontInstaller(args).then((response) => __awaiter(this, void 0, void 0, function* () {
                AppLogger_1.default.getInstance().info(response);
                const result = yield this.fetchStore();
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_FONT_ACTIVATION, result);
            })).catch((err) => this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_FONT_ACTIVATION, err.message));
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_AUTH_USER, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.fontManager.systemAuthenticate(args).then((response) => {
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_AUTH_USER, response);
            });
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_FETCH_NEWS, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.fontManager.fetchLatestNews(args).then((response) => {
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_FETCH_NEWS, response);
            });
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_NEWS_CONTENT, (event, url) => __awaiter(this, void 0, void 0, function* () {
            yield this.fontManager.fetchNewsContent(url).then((response) => {
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_NEWS_CONTENT, response);
            });
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_MESSAGE_BOX, (event, options) => __awaiter(this, void 0, void 0, function* () {
            this.fontManager.showDialogBox(options).then((response) => this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_MESSAGE_BOX, response));
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_OPEN_DIALOG, (event, options) => __awaiter(this, void 0, void 0, function* () {
            this.fontManager.showOpenDialog(options).then((response) => this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_OPEN_DIALOG, response));
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_OPEN_PATH, (_event, path) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.openPath(path); }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_OPEN_FOLDER, (_event, fullPath) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.showItemInFolder(fullPath); }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_OPEN_EXTERNAL, (_event, url) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.openExternal(url); }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_RELOAD_WINDOW, (_event) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.reLaunch(); }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_EXIT, (_event) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.exit(); }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_QUIT, (_event) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.quit(); }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_BEEP, (_event) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.beep(); }));
        /**
         * Collection
         */
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_FETCH_COLLECTIONS, (event, ...args) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.connectionManager.getCollection().find(...args);
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_FETCH_COLLECTIONS, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_CREATE_COLLECTION, (event, parentId) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getCollectionRepository().createCollection(parentId);
            const result = yield this.connectionManager.getCollection().find();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_CREATE_COLLECTION, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_DELETE_COLLECTION, (event, collectionId) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getCollectionRepository().deleteCollection(collectionId);
            yield this.connectionManager.getStoreRepository().deleteCollection(collectionId);
            const result = yield this.connectionManager.getCollection().find();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_DELETE_COLLECTION, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_UPDATE_COLLECTION, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getCollectionRepository().updateCollection(args);
            const result = yield this.connectionManager.getCollection().find();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_UPDATE_COLLECTION, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_RESET_ENABLED, (event) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getCollectionRepository().resetEnabled();
            const result = yield this.connectionManager.getCollection().find();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_RESET_ENABLED, result);
        }));
        /**
         * Store
         */
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_STORE_FETCH_ALL, (event, args) => __awaiter(this, void 0, void 0, function* () {
            if (args.search) {
                const result = yield this.connectionManager.getStoreRepository().search(args);
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_STORE_FETCH_ALL, result);
            }
            else {
                const result = yield this.connectionManager.getStoreRepository().fetch(args);
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_STORE_FETCH_ALL, result);
            }
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_STORE_FETCH_ROW, (event, storeId) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.connectionManager.getStoreRepository().findOne({ where: { id: storeId } });
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_STORE_FETCH_ROW, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_STORE_UPDATE, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getStoreRepository().update(args.id, args.data);
            const result = yield this.connectionManager.getStoreRepository().findOne({ where: { id: args.id } });
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_STORE_UPDATE, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_UPDATE_COUNT, (event, collectionId) => __awaiter(this, void 0, void 0, function* () {
            const { total } = yield this.connectionManager.getStoreRepository().fetchCollectionCount(collectionId);
            yield this.connectionManager.getCollectionRepository().updateCollectionCount(collectionId, total);
            const result = yield this.connectionManager.getCollection().find();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_UPDATE_COUNT, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_UPDATE_COUNTS, (event) => __awaiter(this, void 0, void 0, function* () {
            const items = yield this.connectionManager.getStoreRepository().fetchCollectionsCount();
            yield this.connectionManager.getCollectionRepository().updateCollectionCounts(items);
            const result = yield this.connectionManager.getCollection().find();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_UPDATE_COUNTS, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_SYNC_SYSTEM, (event) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getStoreRepository().resetSystem();
            const paths = this.systemManager.getPlatformFontPaths();
            const promises = [];
            paths.forEach((folder) => __awaiter(this, void 0, void 0, function* () {
                promises.push(this.fontManager.scanFolders(folder, { collection_id: 0, system: 1 }).catch((err) => AppLogger_1.default.getInstance().error(err)));
            }));
            Promise.allSettled(promises).then(() => __awaiter(this, void 0, void 0, function* () {
                const result = yield this.connectionManager.getStoreRepository().fetchSystemStats();
                this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_SYNC_SYSTEM, result);
            }));
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_SYNC_ACTIVATED, (event) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getStoreRepository().resetActivated();
            yield this.connectionManager.getStoreRepository().syncActivated();
            const result = yield this.connectionManager.getStoreRepository().fetchSystemStats();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_SYNC_ACTIVATED, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_RESET_FAVORITES, (event) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getStoreRepository().resetFavorites();
            const result = yield this.connectionManager.getStoreRepository().fetchSystemStats();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_RESET_FAVORITES, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_SYSTEM_STATS, (event) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.connectionManager.getStoreRepository().fetchSystemStats();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_SYSTEM_STATS, results);
        }));
        /**
         * Logger
         */
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_LOGGER_CREATE, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getLoggerRepository().log(args);
            const result = yield this.fetchLogger();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_LOGGER_CREATE, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_LOGGER_QUERY, (event) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.fetchLogger();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_LOGGER_QUERY, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_LOGGER_DELETE_ITEM, (event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getLogger().delete(args.id);
            const result = yield this.fetchLogger();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_LOGGER_DELETE_ITEM, result);
        }));
        this.on(enums_1.ChannelType.IPCMAIN_REQUEST_LOGGER_TRUNCATE, (event) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getLogger().clear();
            const result = yield this.fetchLogger();
            this.send(event, enums_1.ChannelType.IPCMAIN_RESPONSE_LOGGER_TRUNCATE, result);
        }));
    }
    fetchStore() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getStore().find({ order: { id: 'DESC' }, skip: 0, take: 100 });
        });
    }
    fetchCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getCollection().find({ order: { id: 'DESC' }, skip: 0 });
        });
    }
    fetchLogger() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getLogger().find({ order: { id: 'DESC' }, skip: 0, take: 100 });
        });
    }
}
exports.default = MessageHandler;
//# sourceMappingURL=MessageHandler.js.map