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
// import { Logger } from '../database/entity/Logger.schema';
// import { Store, StoreManyAndCountType } from '../database/entity/Store.schema';
const ChannelType_1 = require("../enums/ChannelType");
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
        return event.sender.send(channel, data);
    }
    handle(channel, done) {
        return electron_1.ipcMain.handle(channel, done);
    }
    initialize() {
        this.initSystemCollection();
        this.on(ChannelType_1.ChannelType.IPC_REQUEST_SYSTEM_BOOT, (event, _args) => __awaiter(this, void 0, void 0, function* () {
            let config = this.configManager.toArray();
            let system = this.systemManager.toArray();
            const response = Object.assign(Object.assign({}, config), { system: system });
            this.send(event, ChannelType_1.ChannelType.IPC_RESPONSE_SYSTEM_BOOT, response);
        }));
        this.on(ChannelType_1.ChannelType.IPC_SYSTEM_REBOOT, (_event, _args) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.reLaunch(); }));
        // Config Manager
        this.handle(ChannelType_1.ChannelType.IPC_SET_CONFIG, (_event, args) => __awaiter(this, void 0, void 0, function* () { return this.configManager.set(args.key, args.values); }));
        this.handle(ChannelType_1.ChannelType.IPC_GET_CONFIG, (_event, args) => __awaiter(this, void 0, void 0, function* () { return this.configManager.get(args.key); }));
        this.handle(ChannelType_1.ChannelType.IPC_ZAP_CONFIG, (_event) => __awaiter(this, void 0, void 0, function* () { return this.configManager.clear(); }));
        // Connection Manager
        this.handle(ChannelType_1.ChannelType.IPC_DBCONNECTION_CREATE, (_event, args) => __awaiter(this, void 0, void 0, function* () { return this.configManager.createDbConnection(args); }));
        this.handle(ChannelType_1.ChannelType.IPC_DBCONNECTION_ENABLE, (_event, args) => this.configManager.enableDbConnection(args));
        this.handle(ChannelType_1.ChannelType.IPC_DBCONNECTION_DELETE, (_event, name) => __awaiter(this, void 0, void 0, function* () { return this.configManager.deleteDbConnection(name); }));
        this.handle(ChannelType_1.ChannelType.IPC_DBCONNECTION_TEST, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            const options = this.connectionManager.dataSource.options;
            if (options.database === args.database) {
                return this.connectionManager.isInitialized()
                    .then(() => this.sendMessage('success', 'Connection tested successfully'))
                    .catch((err) => this.sendMessage('error', err.message));
            }
            else {
                return this.connectionManager.createDataSource(args)
                    .then(() => this.sendMessage('success', 'Connection tested successfully'))
                    .catch((err) => this.sendMessage('error', err.message));
            }
        }));
        this.handle(ChannelType_1.ChannelType.IPC_DATABASE_DROP, (_event) => __awaiter(this, void 0, void 0, function* () { return this.connectionManager.getDataSource().dropDatabase(); }));
        // Font Manager
        this.handle(ChannelType_1.ChannelType.IPC_EXEC_CMD, (_event, args) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.executeCommand(args).catch((err) => this.sendMessage('error', err.message)); }));
        this.handle(ChannelType_1.ChannelType.IPC_AUTH_USER, (_event, args) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.systemAuthenticate(args); }));
        this.handle(ChannelType_1.ChannelType.IPC_SCAN_FILES, (event, args) => __awaiter(this, void 0, void 0, function* () {
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
            return Promise.allSettled(promises);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_SCAN_FOLDERS, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            args.folders.forEach((sourceFolder) => __awaiter(this, void 0, void 0, function* () {
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
            return Promise.allSettled(promises);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_ACTIVATE_FONT, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            this.fontManager.fontInstaller(args).catch((err) => this.sendMessage('error', err.message));
        }));
        this.handle(ChannelType_1.ChannelType.IPC_ACTIVATE_FOLDER, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            this.fontManager.folderInstaller(args).catch((err) => this.sendMessage('error', err.message));
        }));
        this.handle(ChannelType_1.ChannelType.IPC_FETCH_NEWS, (_event, args) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.fetchLatestNews(args); }));
        this.handle(ChannelType_1.ChannelType.IPC_SHOW_MESSAGE_BOX, (_event, options) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.showMessageBox(options); }));
        this.handle(ChannelType_1.ChannelType.IPC_SHOW_OPEN_DIALOG, (_event, options) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.showOpenDialog(options); }));
        this.handle(ChannelType_1.ChannelType.IPC_OPEN_PATH, (_event, path) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.openPath(path); }));
        this.handle(ChannelType_1.ChannelType.IPC_OPEN_FOLDER, (_event, fullPath) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.showItemInFolder(fullPath); }));
        this.handle(ChannelType_1.ChannelType.IPC_OPEN_EXTERNAL, (_event, url) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.openExternal(url); }));
        this.on(ChannelType_1.ChannelType.IPC_RELOAD_WINDOW, (_event) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.reLaunch(); }));
        this.on(ChannelType_1.ChannelType.IPC_EXIT, (_event) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.exit(); }));
        this.on(ChannelType_1.ChannelType.IPC_QUIT, (_event) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.quit(); }));
        this.on(ChannelType_1.ChannelType.IPC_BEEP, (_event) => __awaiter(this, void 0, void 0, function* () { return this.fontManager.beep(); }));
        // Collection
        this.handle(ChannelType_1.ChannelType.IPC_COLLECTION_FIND, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getCollection().find(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_COLLECTION_FIND_ONE, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getCollectionRepository().findOne(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_COLLECTION_FIND_ONE_BY, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getCollectionRepository().findOneBy(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_COLLECTION_FETCH, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchCollectionsWithCounts(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_COLLECTION_CREATE, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getCollectionRepository().createCollection(args);
            return yield this.fetchCollectionsWithCounts(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_COLLECTION_UPDATE, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getCollectionRepository().updateCollection(args.collectionId, args.data);
            return yield this.fetchCollectionsWithCounts(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_COLLECTION_DELETE, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getCollectionRepository().deleteCollection(args.collectionId);
            return yield this.fetchCollectionsWithCounts(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_COLLECTION_UPDATE_IDS, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getCollectionRepository().updateCollectionIds(args.ids, args.data);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_COLLECTION_ENABLE, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getCollectionRepository().resetEnabled();
            yield this.connectionManager.getCollectionRepository().updateCollection(args.collectionId, args.data);
            return yield this.fetchCollectionsWithCounts(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_COLLECTION_UPDATE_COUNT, (_event, collectionId) => __awaiter(this, void 0, void 0, function* () {
            const { total } = yield this.connectionManager.getStoreRepository().fetchCollectionCount(collectionId);
            yield this.connectionManager.getCollectionRepository().updateCollectionCount(collectionId, total);
            return yield this.fetchCollectionsWithCounts({});
        }));
        this.handle(ChannelType_1.ChannelType.IPC_COLLECTION_UPDATE_COUNTS, (_event) => __awaiter(this, void 0, void 0, function* () {
            const items = yield this.connectionManager.getStoreRepository().fetchCollectionsCount();
            yield this.connectionManager.getCollectionRepository().updateCollectionCounts(items);
            return yield this.fetchCollectionsWithCounts({});
        }));
        // Store
        this.handle(ChannelType_1.ChannelType.IPC_STORE_FIND, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getStore().find(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_STORE_FIND_ONE, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getStoreRepository().findOne(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_STORE_FIND_ONE_BY, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getStoreRepository().findOneBy(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_STORE_FETCH, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            args.ids = [];
            if (args.collectionId) {
                const row = yield this.connectionManager.getCollectionRepository().findOneBy({ id: args.collectionId });
                if (row) {
                    const children = yield this.connectionManager.getCollectionRepository().fetchChildren(row, true, false);
                    if (Array.isArray(children)) {
                        args.ids = Object.keys(children).map(val => children[val].id);
                    }
                }
            }
            return yield this.connectionManager.getStoreRepository().fetch(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_STORE_SEARCH, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getStoreRepository().search(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_STORE_UPDATE, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getStoreRepository().update(args.id, args.data);
            return yield this.connectionManager.getStoreRepository().findOne({ where: { id: args.id } });
        }));
        this.handle(ChannelType_1.ChannelType.IPC_STORE_SYNC_SYSTEM, (_event) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getStoreRepository().resetSystem();
            const row = yield this.connectionManager.getCollectionRepository().findOneBy({ is_system: 1 });
            if (row) {
                const paths = this.systemManager.getPlatformFontPaths();
                const promises = [];
                paths.forEach((folder) => __awaiter(this, void 0, void 0, function* () {
                    promises.push(this.fontManager.scanFolders(folder, { collection_id: row.id, system: 1 }).catch((err) => AppLogger_1.default.getInstance().error(err)));
                }));
                Promise.allSettled(promises).then(() => __awaiter(this, void 0, void 0, function* () {
                    return yield this.connectionManager.getStoreRepository().fetchSystemStats();
                }));
            }
        }));
        this.handle(ChannelType_1.ChannelType.IPC_STORE_SYNC_ACTIVATED, (_event) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getStoreRepository().resetActivated();
            yield this.connectionManager.getStoreRepository().syncActivated();
            return yield this.connectionManager.getStoreRepository().fetchSystemStats();
        }));
        this.handle(ChannelType_1.ChannelType.IPC_STORE_RESET_FAVORITES, (_event) => __awaiter(this, void 0, void 0, function* () {
            yield this.connectionManager.getStoreRepository().resetFavorites();
            return yield this.connectionManager.getStoreRepository().fetchSystemStats();
        }));
        this.handle(ChannelType_1.ChannelType.IPC_STORE_SYSTEM_STATS, (_event) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getStoreRepository().fetchSystemStats();
        }));
        // Logger
        this.handle(ChannelType_1.ChannelType.IPC_LOGGER_FIND, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getLogger().find(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_LOGGER_FIND_ONE, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getLoggerRepository().findOne(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_LOGGER_FIND_ONE_BY, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getLoggerRepository().findOneBy(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_LOGGER_CREATE, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getLoggerRepository().saveData(args);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_LOGGER_DELETE, (_event, args) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getLogger().delete(args.id);
        }));
        this.handle(ChannelType_1.ChannelType.IPC_LOGGER_TRUNCATE, (_event) => __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getLogger().clear();
        }));
    }
    // Misc
    sendMessage(type, message) {
        return { type, message };
    }
    initSystemCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.connectionManager.getCollectionRepository().findOneBy({ is_system: 1 });
            if (!row) {
                return yield this.connectionManager.getCollectionRepository().createSystemCollection();
            }
            return true;
        });
    }
    fetchCollectionsWithRelations() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getCollection().find({
                relations: {
                    stores: true,
                },
            }).catch((err) => AppLogger_1.default.getInstance().info(err.message));
        });
    }
    fetchCollectionsWithCounts(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.connectionManager.getCollectionRepository().fetchCollectionsWithCounts(args);
        });
    }
}
exports.default = MessageHandler;
//# sourceMappingURL=MessageHandler.js.map