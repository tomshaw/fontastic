"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class DarwinTemplate {
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
            submenu: [
                {
                    label: 'About ElectronReact',
                    selector: 'orderFrontStandardAboutPanel:',
                },
                { type: 'separator' },
                { label: 'Services', submenu: [] },
                { type: 'separator' },
                {
                    label: 'Hide ElectronReact',
                    accelerator: 'Command+H',
                    selector: 'hide:',
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    selector: 'hideOtherApplications:',
                },
                { label: 'Show All', selector: 'unhideAllApplications:' },
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
                { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
                { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
                { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
                { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
                { label: 'Select All', accelerator: 'Command+A', selector: 'selectAll:' }
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
                { label: 'Minimize', accelerator: 'Command+M', selector: 'performMiniaturize:' },
                { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
                { type: 'separator' },
                { label: 'Bring All to Front', selector: 'arrangeInFront:' },
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
exports.default = DarwinTemplate;
//# sourceMappingURL=DarwinTemplate.js.map