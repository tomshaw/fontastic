"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const StorageType_1 = require("../enums/StorageType");
const Store = require('electron-store');
const store = new Store();
class ConfigManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
    }
    set(key, value) {
        store.set(key, value);
    }
    get(key = null) {
        if (key) {
            return store.get(key);
        }
        return store.store;
    }
    has(key) {
        return store.has(key);
    }
    delete(key) {
        return store.delete(key);
    }
    clear() {
        return store.clear();
    }
    toArray() {
        return store.store;
    }
    initialize() {
        this.initDatabaseConfig();
        this.initSettingsConfig();
    }
    initSettingsConfig() {
        const settings = {
            import: {
                type: 'ask',
            },
        };
        if (this.has(StorageType_1.StorageType.Options)) {
            const saved = this.get(StorageType_1.StorageType.Options);
            this.set(StorageType_1.StorageType.Options, Object.assign(Object.assign({}, settings), saved));
        }
        else {
            this.set(StorageType_1.StorageType.Options, settings);
        }
    }
    initDatabaseConfig() {
        let store = this.get(StorageType_1.StorageType.Database);
        // @TODO Remove MySQL connection if not in production.
        // Problematic when switching between production and development. Problem arises when connection is not enabled.
        // database.connections = this.systemManager.isProduction() ? database.connections.filter((item: any) => item.name === 'default') : database.connections;
        // Assign user data path to default database.
        database_1.database.connections = database_1.database.connections.filter((item) => {
            if (item.name === 'default' && item.type === 'sqlite') {
                item.database = this.systemManager.getDatabasePath(item.database);
            }
            return item;
        });
        if (!store) {
            this.set(StorageType_1.StorageType.Database, database_1.database);
        }
        else {
            // Ensure the default SQLite connection exists and has the correct path.
            const connections = store.connections || [];
            const defaultConn = connections.find((item) => item.name === 'default' && item.type === 'sqlite');
            if (defaultConn) {
                defaultConn.database = this.systemManager.getDatabasePath('fontastic.sqlite');
            }
            else {
                connections.unshift(database_1.database.connections.find((item) => item.name === 'default'));
            }
            // Ensure at least the default SQLite connection is enabled.
            const hasEnabled = connections.some((item) => item.enabled);
            if (!hasEnabled) {
                const sqliteConn = connections.find((item) => item.name === 'default' && item.type === 'sqlite');
                if (sqliteConn)
                    sqliteConn.enabled = true;
            }
            store.connections = connections;
            this.set(StorageType_1.StorageType.Database, store);
        }
    }
    createDbConnection(options) {
        if (options.name === 'default') {
            return;
        }
        let connections = this.get(StorageType_1.StorageType.Database).connections;
        const found = connections.find((item) => item.name === options.name);
        if (found) {
            for (const i in connections) {
                if (connections[i].name == options.name) {
                    connections[i] = options;
                }
            }
            this.set(StorageType_1.StorageType.DatabaseConnections, connections);
        }
        else {
            this.set(StorageType_1.StorageType.DatabaseConnections, connections.push(options));
        }
    }
    enableDbConnection(options) {
        let config = this.get(StorageType_1.StorageType.Database);
        config.connections = config.connections.filter((item) => {
            item.enabled = item.name === options.name ? true : false;
            return item;
        });
        this.set(StorageType_1.StorageType.Database, config);
        return config;
    }
    deleteDbConnection(options) {
        if (options.name === 'default') {
            return;
        }
        let connections = this.get(StorageType_1.StorageType.Database).connections;
        const found = connections.find((item) => item.name === options.name);
        if (found) {
            for (const i in connections) {
                if (connections[i].name == options.name) {
                    connections.splice(i, 1);
                }
            }
            this.set(StorageType_1.StorageType.DatabaseConnections, connections);
        }
    }
}
exports.default = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map