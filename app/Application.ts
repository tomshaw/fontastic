import SystemManager from "./core/SystemManager";
import ConfigManager from "./core/ConfigManager";
import ConnectionManager from "./core/ConnectionManager";
import FontManager from "./core/FontManager";
import FontCatalog from "./core/FontCatalog";
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

    const systemManager = new SystemManager(this.machineId);

    const configManager = new ConfigManager(systemManager);

    const connectionManager = new ConnectionManager(configManager);
    await connectionManager.initialize()

    const fontManager = new FontManager(systemManager, configManager, connectionManager);

    const fontCatalog = new FontCatalog(systemManager, configManager);

    const messageHandler = new MessageHandler(systemManager, configManager, connectionManager, fontManager, fontCatalog);
    messageHandler.initialize();
  }
}
