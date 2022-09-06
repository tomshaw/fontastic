"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const channel = require("../config");
const Store = require('electron-store');
const store = new Store();
class ConfigManager {
    constructor(systemManager) {
        this.setSystemManager(systemManager);
        this.initUserConfig();
        this.initDatabaseConfig();
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
    const(name) {
        return channel[name];
    }
    initUserConfig() {
        this.set('user', {
            uptime: this.getSystemManager().getUpTime(),
            locale: this.getSystemManager().getLocale()
        });
    }
    initDatabaseConfig() {
        let config = this.const('database');
        let store = this.get('database');
        // Remove MySQL connection if not in production.
        config.connections = this.getSystemManager().isProduction() ? config.connections.filter((item) => item.name === "default") : config.connections;
        // Assign user data path to default database.
        config.connections = config.connections.filter((item) => {
            if (item.name === "default" && item.type === "sqlite") {
                item.database = this.getSystemManager().getDatabasePath(item.database);
            }
            return item;
        });
        if (!store) {
            this.set('database', config);
        }
        else {
            // reset store.
            // this.set('database', config);
        }
    }
    enableDbConnection(connection) {
        let config = this.get('database');
        config.connections = config.connections.filter((item) => {
            item.enabled = (item.name === connection.name) ? true : false;
            return item;
        });
        this.set('database', config);
    }
    saveDbConnection(options) {
        let connections = this.get('database.connections');
        const found = connections.find((x) => x.name === options.name);
        if (found) {
            for (const i in connections) {
                if (connections[i].name == options.name) {
                    connections[i] = options;
                }
            }
            this.set("database.connections", connections);
        }
        else {
            this.set("database.connections", connections.push(options));
        }
    }
    deleteDbConnection(name) {
        let connections = this.get('database.connections');
        const found = connections.find((x) => x.name === name);
        if (found) {
            for (const i in connections) {
                if (connections[i].name == name) {
                    connections.splice(i, 1);
                }
            }
            this.set("database.connections", connections);
        }
    }
}
exports.default = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map