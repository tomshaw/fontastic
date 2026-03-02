import { DataSource, DataSourceOptions } from 'typeorm'
import { Collection, Store, Logger } from '../database/entity';
import { CollectionRepository, LoggerRepository, StoreRepository } from '../database/repository';
import ConfigManager from './ConfigManager';
import { StorageType } from '../enums/StorageType';

export default class ConnectionManager {

  configManager: ConfigManager;
  options: DataSourceOptions[];
  
  dataSource: DataSource;

  schemas: any[] = [Collection, Store, Logger];
  subscribers: any[] = []
  migrations: any[] = [];

  omitables: any[] = ['title', 'description', 'enabled'];

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;

    this.options = this.normalize(this.configManager.get(StorageType.DatabaseConnections));

    this.registerEntities(this.options);
    this.registerSubscribers(this.options);
    this.registerMigrations(this.options);

    this.dataSource = new DataSource(this.options[0]);
  }

  async initialize() {
    return await this.dataSource.initialize();
  }

  async isInitialized() {
    return this.dataSource.isInitialized;
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  createDataSource(options: DataSourceOptions) {
    return new DataSource(this.discardOmitables(options)).initialize()
  }

  registerEntities(options: DataSourceOptions[]) {
    this.options = options.map(obj => ({ ...obj, entities: this.schemas }))
  }

  registerSubscribers(options: DataSourceOptions[]) {
    this.options = options.map(obj => ({ ...obj, subscribers: this.subscribers }))
  }

  registerMigrations(options: DataSourceOptions[]) {
    this.options = options.map(obj => ({ ...obj, migrations: this.migrations }))
  }

  discardOmitables(options: object | any): object | any {
    return Object.fromEntries(Object.entries(options).filter(([key]) => !this.omitables.includes(key)));
  }

  normalize(options: DataSourceOptions[]) {
    return options.filter((item: DataSourceOptions) => this.discardOmitables(item)).filter((item: any) => item.enabled)
  }

  /**
   * Proxy methods 
   */

  getCollection() {
    return this.dataSource.getRepository(Collection)
  }

  getLogger() {
    return this.dataSource.getRepository(Logger)
  }

  getStore() {
    return this.dataSource.getRepository(Store)
  }

  getCollectionRepository() {
    return this.getCollection().extend(CollectionRepository);
  }

  getLoggerRepository() {
    return this.getLogger().extend(LoggerRepository);
  }

  getStoreRepository() {
    return this.getStore().extend(StoreRepository);
  }
}