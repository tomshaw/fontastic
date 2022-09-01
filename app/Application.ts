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

    let configManager = new ConfigManager(systemManager);

    let connectionManager = new ConnectionManager(configManager);
    await connectionManager.initialize()

    let fontManager = new FontManager(systemManager, configManager, connectionManager);

    let messageHandler = new MessageHandler(systemManager, configManager, connectionManager, fontManager);
    messageHandler.initialize();
  }
}
