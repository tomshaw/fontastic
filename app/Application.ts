import SystemManager from "./core/SystemManager";
import ConfigManager from "./core/ConfigManager";
import ConnectionManager from "./core/ConnectionManager";
import FontManager from "./core/FontManager";
import MessageHandler from "./core/MessageHandler";

export default class Application {

  machineId: string;
  isProduction: boolean;

  constructor(machineId: string, isProduction: boolean) {
    this.machineId = machineId;
    this.isProduction = isProduction;
    this.init();
  }

  async init() {

    let systemManager = new SystemManager(this.machineId);
    console.log("System Manager - toArray", systemManager.toArray());

    let configManager = new ConfigManager(systemManager);
    configManager.initUserConfig();
    configManager.initDatabaseConfig();
    // console.log(configManager.get("database"));
    // console.log(configManager.get("news"));

    let connectionManager = new ConnectionManager(configManager);
    await connectionManager.initialize()

    let fontManager = new FontManager(systemManager, configManager, connectionManager);

    let messageHandler = new MessageHandler(systemManager, configManager, connectionManager, fontManager);
    messageHandler.initialize();
  }
}
