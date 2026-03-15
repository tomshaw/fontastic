"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SystemManager_1 = require("./core/SystemManager");
const ConfigManager_1 = require("./core/ConfigManager");
const ConnectionManager_1 = require("./core/ConnectionManager");
const FontManager_1 = require("./core/FontManager");
const MessageHandler_1 = require("./core/MessageHandler");
const MenuBuilder_1 = require("./core/menu/MenuBuilder");
class Application {
    constructor(machineId, isProduction, mainWindow) {
        this.machineId = machineId;
        this.isProduction = isProduction;
        this.mainWindow = mainWindow;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const systemManager = new SystemManager_1.default(this.machineId, this.isProduction);
            const configManager = new ConfigManager_1.default(systemManager);
            configManager.initialize();
            const menuBuilder = new MenuBuilder_1.default(this.mainWindow, this.isProduction);
            const connectionManager = new ConnectionManager_1.default(configManager);
            // Initialize menu and database connection in parallel — menu doesn't depend on DB
            yield Promise.all([connectionManager.initialize(), Promise.resolve(menuBuilder.initialize())]);
            const fontManager = new FontManager_1.default(systemManager, configManager, connectionManager);
            const messageHandler = new MessageHandler_1.default(systemManager, configManager, connectionManager, fontManager);
            messageHandler.initialize();
        });
    }
}
exports.default = Application;
//# sourceMappingURL=Application.js.map