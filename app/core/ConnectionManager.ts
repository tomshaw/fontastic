import { DataSource } from "typeorm"
import { Collection, Store, Logger } from "../database/entity";
import { CollectionRepository, LoggerRepository, StoreRepository } from "../database/repository";
import ConfigManager from "./ConfigManager";

export default class ConnectionManager {

  configManager: ConfigManager;

  schemas: any[] = [Collection, Store, Logger];
  subscribers: any[] = []
  migrations: any[] = [];

  dataSource: DataSource;

  connections: any = {};

  omitables: any[] = ["title", "description", "enabled"];

  constructor(
    configManager: ConfigManager
  ) {

    this.setConfigManager(configManager);

    let config = this.getConfigManager().get("database");

    this.setConnections(this.normalize(config.connections));

    this.registerEntities(this.connections);

    this.registerSubscribers(this.connections);

    this.registerMigrations(this.connections);

    this.createDataSource();
  }

  setConfigManager(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  getConfigManager(): ConfigManager {
    return this.configManager;
  }

  normalize(connections: any) {
    return connections.filter((item: any) => this.discardOmitables(item)).filter((item: any) => item.enabled)
  }

  setConnections(connections: any[]) {
    this.connections = connections;
  }

  getConnections() {
    return this.connections;
  }

  registerEntities(options: any[]) {
    this.connections = options.map(obj => ({ ...obj, entities: this.schemas }))
  }

  registerSubscribers(options: any[]) {
    this.connections = options.map(obj => ({ ...obj, subscribers: this.subscribers }))
  }

  registerMigrations(options: any[]) {
    this.connections = options.map(obj => ({ ...obj, migrations: this.migrations }))
  }

  setDataSource() {
    this.dataSource = new DataSource(this.connections[0]);
  }

  getDataSource() {
    return this.dataSource;
  }

  createDataSource() {
    this.setDataSource();
  }

  async initialize() {
    return await this.getDataSource().initialize();
  }

  async isInitialized() {
    return this.getDataSource().isInitialized;
  }

  discardOmitables(options: object | any): object | any {
    return Object.fromEntries(Object.entries(options).filter(([key]) => !this.omitables.includes(key)));
  }

  createDataSourceWithOptions(options: any) {
    return new DataSource(this.discardOmitables(options)).initialize()
  }

  async dropDatabase() {
    const dataSource = this.getDataSource();
    return await dataSource.dropDatabase()
  }

  async truncateDatabase() {
    this.getCollection().clear();
    this.getLogger().clear();
    this.getStore().clear();
  }

  /**
   * Repository methods. 
   */

  getCollection() {
    return this.getDataSource().getRepository(Collection)
  }

  getLogger() {
    return this.getDataSource().getRepository(Logger)
  }

  getStore() {
    return this.getDataSource().getRepository(Store)
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