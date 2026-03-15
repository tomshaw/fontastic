import { safeStorage } from 'electron';
import SystemManager from './SystemManager';
import { database } from '../config/database';
import { StorageType } from '../enums/StorageType';

const Store = require('electron-store');
const store = new Store();

export default class ConfigManager {
  systemManager: SystemManager;

  constructor(systemManager: SystemManager) {
    this.systemManager = systemManager;
  }

  set(key: string, value: any): void {
    store.set(key, value);
  }

  get(key: string = null): any {
    if (key) {
      return store.get(key);
    }
    return store.store;
  }

  has(key: string): boolean {
    return store.has(key);
  }

  delete(key: string): any {
    return store.delete(key);
  }

  clear(): any {
    return store.clear();
  }

  // --- Safe Storage (OS keychain encryption) ---

  setSecure(key: string, value: string): void {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(value);
      store.set(key, encrypted.toString('base64'));
    } else {
      store.set(key, value);
    }
  }

  getSecure(key: string): string | null {
    const raw = store.get(key);
    if (!raw) return null;

    if (safeStorage.isEncryptionAvailable() && typeof raw === 'string') {
      try {
        const buffer = Buffer.from(raw, 'base64');
        return safeStorage.decryptString(buffer);
      } catch {
        // Fallback: value may have been stored before encryption was enabled
        return raw;
      }
    }
    return typeof raw === 'string' ? raw : null;
  }

  toArray(): any {
    return store.store;
  }

  initialize(): void {
    this.initDatabaseConfig();
    this.initSettingsConfig();
  }

  initSettingsConfig(): void {
    const settings = {
      import: {
        type: 'ask',
      },
    };
    if (this.has(StorageType.Options)) {
      const saved = this.get(StorageType.Options);
      this.set(StorageType.Options, { ...settings, ...saved });
    } else {
      this.set(StorageType.Options, settings);
    }
  }

  initDatabaseConfig(): void {
    let store = this.get(StorageType.Database);

    // @TODO Remove MySQL connection if not in production.
    // Problematic when switching between production and development. Problem arises when connection is not enabled.
    // database.connections = this.systemManager.isProduction() ? database.connections.filter((item: any) => item.name === 'default') : database.connections;

    // Assign user data path to default database.
    database.connections = database.connections.filter((item: any) => {
      if (item.name === 'default' && item.type === 'better-sqlite3') {
        item.database = this.systemManager.getDatabasePath(item.database);
      }
      return item;
    });

    if (!store) {
      this.set(StorageType.Database, database);
    } else {
      // Ensure the default SQLite connection exists and has the correct path.
      const connections = store.connections || [];
      const defaultConn = connections.find((item: any) => item.name === 'default' && item.type === 'better-sqlite3');
      if (defaultConn) {
        defaultConn.database = this.systemManager.getDatabasePath('fontastic.sqlite');
      } else {
        connections.unshift(database.connections.find((item: any) => item.name === 'default'));
      }
      // Ensure at least the default SQLite connection is enabled.
      const hasEnabled = connections.some((item: any) => item.enabled);
      if (!hasEnabled) {
        const sqliteConn = connections.find((item: any) => item.name === 'default' && item.type === 'better-sqlite3');
        if (sqliteConn) sqliteConn.enabled = true;
      }
      store.connections = connections;
      this.set(StorageType.Database, store);
    }
  }

  createDbConnection(options: any): void {
    if (options.name === 'default') {
      return;
    }

    let connections = this.get(StorageType.Database).connections;

    const found = connections.find((item: any) => item.name === options.name);

    if (found) {
      for (const i in connections) {
        if (connections[i].name == options.name) {
          connections[i] = options;
        }
      }
      this.set(StorageType.DatabaseConnections, connections);
    } else {
      this.set(StorageType.DatabaseConnections, connections.push(options));
    }
  }

  enableDbConnection(options: any): void {
    let config = this.get(StorageType.Database);

    config.connections = config.connections.filter((item: any) => {
      item.enabled = item.name === options.name ? true : false;
      return item;
    });

    this.set(StorageType.Database, config);

    return config;
  }

  deleteDbConnection(options: any): void {
    if (options.name === 'default') {
      return;
    }

    let connections = this.get(StorageType.Database).connections;

    const found = connections.find((item: any) => item.name === options.name);

    if (found) {
      for (const i in connections) {
        if (connections[i].name == options.name) {
          connections.splice(i, 1);
        }
      }
      this.set(StorageType.DatabaseConnections, connections);
    }
  }
}
