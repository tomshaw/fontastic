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
const typeorm_1 = require("typeorm");
const entity_1 = require("../database/entity");
const repository_1 = require("../database/repository");
const StorageType_1 = require("../enums/StorageType");
class ConnectionManager {
    constructor(configManager) {
        this.schemas = [entity_1.Collection, entity_1.Store, entity_1.Logger];
        this.subscribers = [];
        this.migrations = [];
        this.omitables = ['title', 'description', 'enabled'];
        this.configManager = configManager;
        this.options = this.normalize(this.configManager.get(StorageType_1.StorageType.DatabaseConnections));
        this.registerEntities(this.options);
        this.registerSubscribers(this.options);
        this.registerMigrations(this.options);
        this.dataSource = new typeorm_1.DataSource(this.options[0]);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.dataSource.initialize();
        });
    }
    isInitialized() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dataSource.isInitialized;
        });
    }
    getDataSource() {
        return this.dataSource;
    }
    createDataSource(options) {
        return new typeorm_1.DataSource(this.discardOmitables(options)).initialize();
    }
    registerEntities(options) {
        this.options = options.map(obj => (Object.assign(Object.assign({}, obj), { entities: this.schemas })));
    }
    registerSubscribers(options) {
        this.options = options.map(obj => (Object.assign(Object.assign({}, obj), { subscribers: this.subscribers })));
    }
    registerMigrations(options) {
        this.options = options.map(obj => (Object.assign(Object.assign({}, obj), { migrations: this.migrations })));
    }
    discardOmitables(options) {
        return Object.fromEntries(Object.entries(options).filter(([key]) => !this.omitables.includes(key)));
    }
    normalize(options) {
        return options.filter((item) => this.discardOmitables(item)).filter((item) => item.enabled);
    }
    /**
     * Proxy methods
     */
    getCollection() {
        return this.dataSource.getRepository(entity_1.Collection);
    }
    getLogger() {
        return this.dataSource.getRepository(entity_1.Logger);
    }
    getStore() {
        return this.dataSource.getRepository(entity_1.Store);
    }
    getCollectionRepository() {
        return this.getCollection().extend(repository_1.CollectionRepository);
    }
    getLoggerRepository() {
        return this.getLogger().extend(repository_1.LoggerRepository);
    }
    getStoreRepository() {
        return this.getStore().extend(repository_1.StoreRepository);
    }
}
exports.default = ConnectionManager;
//# sourceMappingURL=ConnectionManager.js.map