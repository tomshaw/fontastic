"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class MenuBuilder {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
    }
    buildMenu(isDev) {
        if (isDev) {
            this.setupDevelopmentEnvironment();
        }
    }
    setupDevelopmentEnvironment() {
        this.mainWindow.webContents.on('context-menu', (_, props) => {
            const { x, y } = props;
            electron_1.Menu.buildFromTemplate([
                {
                    label: 'Inspect element',
                    click: () => {
                        this.mainWindow.webContents.inspectElement(x, y);
                    },
                },
            ]).popup({ window: this.mainWindow });
        });
    }
}
exports.default = MenuBuilder;
//# sourceMappingURL=Builder.js.map