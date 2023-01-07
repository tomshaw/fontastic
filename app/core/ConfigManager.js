"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const constants = require("../config/constants");
const Store = require('electron-store');
const store = new Store();
class ConfigManager {
    constructor(systemManager) {
        this.setSystemManager(systemManager);
        // store.delete('settings');
    }
    setSystemManager(systemManager) {
        this.systemManager = systemManager;
    }
    getSystemManager() {
        return this.systemManager;
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
    initialize() {
        this.initDatabaseConfig();
        this.initSettingsConfig();
    }
    initSettingsConfig() {
        const settings = {
            import: {
                type: 'ask'
            }
        };
        if (this.has(constants.STORE_SETTINGS)) {
            const saved = this.get(constants.STORE_SETTINGS);
            this.set('settings', Object.assign(Object.assign({}, settings), saved));
        }
        else {
            this.set('settings', settings);
        }
    }
    initDatabaseConfig() {
        let store = this.get(constants.STORE_DATABASE);
        // @TODO Remove MySQL connection if not in production.
        // Problematic when switching between production and development. Problem arises when connection is not enabled.
        // database.connections = this.getSystemManager().isProduction() ? database.connections.filter((item: any) => item.name === 'default') : database.connections;
        // Assign user data path to default database.
        database_1.database.connections = database_1.database.connections.filter((item) => {
            if (item.name === 'default' && item.type === 'sqlite') {
                item.database = this.getSystemManager().getDatabasePath(item.database);
            }
            return item;
        });
        if (!store) {
            this.set(constants.STORE_DATABASE, database_1.database);
        }
        else {
            // Resets database store.
            //this.set(constants.STORE_DATABASE, database);
        }
    }
    enableDbConnection(connection) {
        let config = this.get(constants.STORE_DATABASE);
        config.connections = config.connections.filter((item) => {
            item.enabled = (item.name === connection.name) ? true : false;
            return item;
        });
        this.set(constants.STORE_DATABASE, config);
    }
    saveDbConnection(options) {
        let connections = this.get(constants.STORE_DATABASE).connections;
        const found = connections.find((item) => item.name === options.name);
        if (found) {
            for (const i in connections) {
                if (connections[i].name == options.name) {
                    connections[i] = options;
                }
            }
            this.set(constants.STORE_DATABASE_CONNECTIONS, connections);
        }
        else {
            this.set(constants.STORE_DATABASE_CONNECTIONS, connections.push(options));
        }
    }
    deleteDbConnection(name) {
        let connections = this.get(constants.STORE_DATABASE).connections;
        const found = connections.find((item) => item.name === name);
        if (found) {
            for (const i in connections) {
                if (connections[i].name == name) {
                    connections.splice(i, 1);
                }
            }
            this.set(constants.STORE_DATABASE_CONNECTIONS, connections);
        }
    }
}
exports.default = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map