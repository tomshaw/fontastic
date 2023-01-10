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
  }

  async initialize() {
    const systemManager = new SystemManager(this.machineId, this.isProduction);

    const configManager = new ConfigManager(systemManager);
    configManager.initialize();

    const connectionManager = new ConnectionManager(configManager);
    await connectionManager.initialize()

    const fontManager = new FontManager(systemManager, configManager, connectionManager);

    const messageHandler = new MessageHandler(systemManager, configManager, connectionManager, fontManager);
    messageHandler.initialize();
  }
}
