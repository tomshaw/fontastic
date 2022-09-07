import SystemManager from "./SystemManager";
import * as channel from '../config';

const Store = require('electron-store');
const store = new Store();

export default class ConfigManager {

  systemManager: SystemManager;

  constructor(systemManager: SystemManager) {
    this.setSystemManager(systemManager);

    this.initUserConfig();
    this.initDatabaseConfig();
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

  const(name: any | string): any {
    return channel[name];
  }

  initUserConfig(): void {
    this.set('user', {
      uptime: this.getSystemManager().getUpTime(),
      locale: this.getSystemManager().getLocale()
    });
  }

  initDatabaseConfig(): void {
    let config = this.const('database');
    let store = this.get('database');

    // Remove MySQL connection if not in production.
    // Problematic when switching between production and development. Problem arises when connection is not enabled.
    // config.connections = this.getSystemManager().isProduction() ? config.connections.filter((item: any) => item.name === "default") : config.connections;

    // Assign user data path to default database.
    config.connections = config.connections.filter((item: any) => {
      if (item.name === "default" && item.type === "sqlite") {
        item.database = this.getSystemManager().getDatabasePath(item.database);
      }
      return item;
    })

    if (!store) {
      this.set('database', config);
    } else {
      // reset store.
      // this.set('database', config);
    }
  }

  enableDbConnection(connection: any): void {
    let config = this.get('database');

    config.connections = config.connections.filter((item: any) => {
      item.enabled = (item.name === connection.name) ?  true : false;
      return item;
    })

    this.set('database', config);
  }

  saveDbConnection(options: any): void {
    let connections = this.get('database.connections');

    const found = connections.find((x: any) => x.name === options.name);

    if (found) {
      for (const i in connections) {
        if (connections[i].name == options.name) {
          connections[i] = options;
        }
      }
      this.set("database.connections", connections);
    } else {
      this.set("database.connections", connections.push(options));
    }
  }

  deleteDbConnection(name: string): void {
    let connections = this.get('database.connections');

    const found = connections.find((x: any) => x.name === name);

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
