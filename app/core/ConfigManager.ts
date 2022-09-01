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
    config.connections = this.getSystemManager().isProduction() ? config.connections.filter((item: any) => item.name === "default") : config.connections;

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
      //this.set('database', config);
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
}