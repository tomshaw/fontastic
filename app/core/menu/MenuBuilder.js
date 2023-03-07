"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const DarwinTemplate_1 = require("./templates/DarwinTemplate");
const SystemTemplate_1 = require("./templates/SystemTemplate");
class MenuBuilder {
    constructor(mainWindow, isProduction) {
        this.isProductionReady = false;
        this.mainWindow = mainWindow;
        this.isProduction = isProduction;
        if (!this.isProduction) {
            this.buildContextMenu();
        }
    }
    buildContextMenu() {
        this.mainWindow.webContents.on('context-menu', (_, props) => {
            const { x, y } = props;
            electron_1.Menu.buildFromTemplate([{
                    label: 'Inspect element',
                    click: () => {
                        this.mainWindow.webContents.inspectElement(x, y);
                    },
                }]).popup({ window: this.mainWindow });
        });
    }
    initialize() {
        if (!this.isProductionReady) {
            return;
        }
        const template = process.platform === 'darwin' ? this.buildDarwinTemplate() : this.buildDefaultTemplate();
        const menu = electron_1.Menu.buildFromTemplate(template);
        electron_1.Menu.setApplicationMenu(menu);
        return menu;
    }
    buildDarwinTemplate() {
        const template = new DarwinTemplate_1.default(this.mainWindow, this.isProduction);
        return template.build();
    }
    buildDefaultTemplate() {
        const template = new SystemTemplate_1.default(this.mainWindow, this.isProduction);
        return template.build();
    }
}
exports.default = MenuBuilder;
//# sourceMappingURL=MenuBuilder.js.map