import SystemManager from './SystemManager';
import { database } from '../config/database';
import * as constants from '../config/constants';

const Store = require('electron-store');
const store = new Store();

export default class ConfigManager {

  systemManager: SystemManager;

  constructor(systemManager: SystemManager) {
    this.setSystemManager(systemManager);
    // store.delete('settings');
  }

  setSystemManager(systemManager: SystemManager) {
    this.systemManager = systemManager;
  }

  getSystemManager(): SystemManager {
    return this.systemManager;
  }

  set(key: string, value: any) {
    store.set(key, value);
  }

  get(key: string = null): any {
    if (key) {
      return store.get(key);
    }
    return store.store;
  }

  has(key: string): any {
    return store.has(key);
  }

  delete(key: string): any {
    return store.delete(key);
  }

  clear(): any {
    return store.clear();
  }

  initialize() {
    this.initDatabaseConfig();
    this.initSettingsConfig();
  }

  initSettingsConfig(): void {
    const settings = {
      import: {
        type: 'ask'
      }
    };
    if (this.has(constants.STORE_SETTINGS)) {
      const saved = this.get(constants.STORE_SETTINGS);
      this.set('settings', { ...settings, ...saved });
    } else {
      this.set('settings', settings);
    }
  }

  initDatabaseConfig(): void {
    let store = this.get(constants.STORE_DATABASE);

    // @TODO Remove MySQL connection if not in production.
    // Problematic when switching between production and development. Problem arises when connection is not enabled.
    // database.connections = this.getSystemManager().isProduction() ? database.connections.filter((item: any) => item.name === 'default') : database.connections;

    // Assign user data path to default database.
    database.connections = database.connections.filter((item: any) => {
      if (item.name === 'default' && item.type === 'sqlite') {
        item.database = this.getSystemManager().getDatabasePath(item.database);
      }
      return item;
    })

    if (!store) {
      this.set(constants.STORE_DATABASE, database);
    } else {
      // Resets database store.
      //this.set(constants.STORE_DATABASE, database);
    }
  }

  enableDbConnection(connection: any): void {
    let config = this.get(constants.STORE_DATABASE);

    config.connections = config.connections.filter((item: any) => {
      item.enabled = (item.name === connection.name) ? true : false;
      return item;
    })

    this.set(constants.STORE_DATABASE, config);
  }

  saveDbConnection(options: any): void {
    let connections = this.get(constants.STORE_DATABASE).connections;

    const found = connections.find((item: any) => item.name === options.name);

    if (found) {
      for (const i in connections) {
        if (connections[i].name == options.name) {
          connections[i] = options;
        }
      }
      this.set(constants.STORE_DATABASE_CONNECTIONS, connections);
    } else {
      this.set(constants.STORE_DATABASE_CONNECTIONS, connections.push(options));
    }
  }

  deleteDbConnection(name: string): void {
    let connections = this.get(constants.STORE_DATABASE).connections;

    const found = connections.find((item: any) => item.name === name);

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
