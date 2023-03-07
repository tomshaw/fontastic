"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class SystemTemplate {
    constructor(mainWindow, isProduction) {
        this.mainWindow = mainWindow;
        this.isProduction = isProduction;
    }
    build() {
        const subMenuAbout = this.addSubMenuAbout();
        const subMenuEdit = this.addSubMenuEdit();
        const subMenuView = this.addSubMenuView();
        const subMenuWindow = this.addSubMenuWindow();
        const subMenuHelp = this.addSubMenuHelp();
        return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
    }
    addSubMenuAbout() {
        return {
            label: 'Electron',
            submenu: [{
                    label: 'About ElectronReact',
                    accelerator: 'Command+H'
                },
                { type: 'separator' },
                { label: 'Services', submenu: [] },
                { type: 'separator' },
                {
                    label: 'Hide ElectronReact',
                    accelerator: 'Command+H'
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H'
                },
                { label: 'Show All' },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => {
                        electron_1.app.quit();
                    },
                },
            ],
        };
    }
    addSubMenuEdit() {
        return {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'Command+Z' },
                { label: 'Redo', accelerator: 'Shift+Command+Z' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'Command+X' },
                { label: 'Copy', accelerator: 'Command+C' },
                { label: 'Paste', accelerator: 'Command+V' },
                { label: 'Select All', accelerator: 'Command+A' }
            ],
        };
    }
    addSubMenuView() {
        return {
            label: 'View',
            submenu: [{
                    label: 'Reload',
                    accelerator: 'Command+R',
                    click: () => {
                        this.mainWindow.webContents.reload();
                    },
                }, {
                    label: 'Toggle Full Screen',
                    accelerator: 'Ctrl+Command+F',
                    click: () => {
                        this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                    },
                }, {
                    label: 'Toggle Developer Tools',
                    accelerator: 'Alt+Command+I',
                    click: () => {
                        this.mainWindow.webContents.toggleDevTools();
                    },
                }]
        };
    }
    addSubMenuWindow() {
        return {
            label: 'Window',
            submenu: [
                { label: 'Minimize', accelerator: 'Command+M' },
                { label: 'Close', accelerator: 'Command+W' },
                { type: 'separator' },
                { label: 'Bring All to Front' },
            ]
        };
    }
    addSubMenuHelp() {
        return {
            label: 'Help',
            submenu: [{
                    label: 'Learn More',
                    click() {
                        electron_1.shell.openExternal('https://electronjs.org');
                    },
                }, {
                    label: 'Documentation',
                    click() {
                        electron_1.shell.openExternal('https://github.com/electron/electron/tree/main/docs#readme');
                    },
                }, {
                    label: 'Community Discussions',
                    click() {
                        electron_1.shell.openExternal('https://www.electronjs.org/community');
                    },
                }, {
                    label: 'Search Issues',
                    click() {
                        electron_1.shell.openExternal('https://github.com/electron/electron/issues');
                    },
                }]
        };
    }
}
exports.default = SystemTemplate;
//# sourceMappingURL=SystemTemplate.js.map