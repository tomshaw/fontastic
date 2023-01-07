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
const constants = require("../config/constants");
class ConnectionManager {
    constructor(configManager) {
        this.schemas = [entity_1.Collection, entity_1.Store, entity_1.Logger];
        this.subscribers = [];
        this.migrations = [];
        this.connections = {};
        this.omitables = ['title', 'description', 'enabled'];
        this.setConfigManager(configManager);
        const dbConfig = this.getConfigManager().get(constants.STORE_DATABASE);
        this.setConnections(this.normalize(dbConfig.connections));
        this.registerEntities(this.connections);
        this.registerSubscribers(this.connections);
        this.registerMigrations(this.connections);
        this.createDataSource();
    }
    setConfigManager(configManager) {
        this.configManager = configManager;
    }
    getConfigManager() {
        return this.configManager;
    }
    normalize(connections) {
        return connections.filter((item) => this.discardOmitables(item)).filter((item) => item.enabled);
    }
    setConnections(connections) {
        this.connections = connections;
    }
    getConnections() {
        return this.connections;
    }
    registerEntities(options) {
        this.connections = options.map(obj => (Object.assign(Object.assign({}, obj), { entities: this.schemas })));
    }
    registerSubscribers(options) {
        this.connections = options.map(obj => (Object.assign(Object.assign({}, obj), { subscribers: this.subscribers })));
    }
    registerMigrations(options) {
        this.connections = options.map(obj => (Object.assign(Object.assign({}, obj), { migrations: this.migrations })));
    }
    setDataSource() {
        this.dataSource = new typeorm_1.DataSource(this.connections[0]);
    }
    getDataSource() {
        return this.dataSource;
    }
    createDataSource() {
        this.setDataSource();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getDataSource().initialize();
        });
    }
    isInitialized() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getDataSource().isInitialized;
        });
    }
    discardOmitables(options) {
        return Object.fromEntries(Object.entries(options).filter(([key]) => !this.omitables.includes(key)));
    }
    createDataSourceWithOptions(options) {
        return new typeorm_1.DataSource(this.discardOmitables(options)).initialize();
    }
    dropDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            const dataSource = this.getDataSource();
            return yield dataSource.dropDatabase();
        });
    }
    /**
     * Repository methods.
     */
    getCollection() {
        return this.getDataSource().getRepository(entity_1.Collection);
    }
    getLogger() {
        return this.getDataSource().getRepository(entity_1.Logger);
    }
    getStore() {
        return this.getDataSource().getRepository(entity_1.Store);
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