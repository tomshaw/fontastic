import SystemManager from './core/SystemManager';
import ConfigManager from './core/ConfigManager';
import ConnectionManager from './core/ConnectionManager';
import FontManager from './core/FontManager';
import MessageHandler from './core/MessageHandler';
import MenuBuilder from './core/menu/MenuBuilder';
import { BrowserWindow } from 'electron';

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

    const menuBuilder = new MenuBuilder(this.mainWindow, this.isProduction);

    const connectionManager = new ConnectionManager(configManager);

    // Initialize menu and database connection in parallel — menu doesn't depend on DB
    await Promise.all([connectionManager.initialize(), Promise.resolve(menuBuilder.initialize())]);

    const fontManager = new FontManager(systemManager, configManager, connectionManager);

    const messageHandler = new MessageHandler(systemManager, configManager, connectionManager, fontManager);
    messageHandler.initialize();
  }
}
