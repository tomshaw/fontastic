import SystemManager from "./core/SystemManager";
import ConfigManager from "./core/ConfigManager";
import ConnectionManager from "./core/ConnectionManager";
import FontManager from "./core/FontManager";
import MessageHandler from "./core/MessageHandler";
import MenuBuilder from "./core/menu/MenuBuilder";
import { BrowserWindow } from "electron";

export default class Application {

  machineId: string;
  isProduction: boolean;
  mainWindow: BrowserWindow;

  constructor(machineId: string, isProduction: boolean, mainWindow: BrowserWindow) {
    this.machineId = machineId;
    this.isProduction = isProduction;
    this.mainWindow = mainWindow;
  }

  async initialize() {
    const systemManager = new SystemManager(this.machineId, this.isProduction);

    const configManager = new ConfigManager(systemManager);
    configManager.initialize();

    const connectionManager = new ConnectionManager(configManager);
    await connectionManager.initialize()

    const fontManager = new FontManager(systemManager, configManager, connectionManager);

    const menuBuilder = new MenuBuilder(this.mainWindow, this.isProduction);
    menuBuilder.initialize();

    const messageHandler = new MessageHandler(systemManager, configManager, connectionManager, fontManager);
    messageHandler.initialize();
  }
}
