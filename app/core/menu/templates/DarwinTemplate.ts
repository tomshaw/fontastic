import { app, Menu, shell, BrowserWindow, MenuItemConstructorOptions } from 'electron';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class DarwinTemplate {
  mainWindow: BrowserWindow;
  isProduction: boolean;

  constructor(mainWindow: BrowserWindow, isProduction: boolean) {
    this.mainWindow = mainWindow;
    this.isProduction = isProduction;
  }

  build(): MenuItemConstructorOptions[] {
    const subMenuAbout = this.addSubMenuAbout();
    const subMenuEdit = this.addSubMenuEdit();
    const subMenuView = this.addSubMenuView();
    const subMenuWindow = this.addSubMenuWindow();
    const subMenuHelp = this.addSubMenuHelp();

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  addSubMenuAbout(): MenuItemConstructorOptions | DarwinMenuItemConstructorOptions {
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
            app.quit();
          },
        },
      ],
    };
  }

  addSubMenuEdit(): DarwinMenuItemConstructorOptions {
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

  addSubMenuView(): MenuItemConstructorOptions {
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

  addSubMenuWindow(): DarwinMenuItemConstructorOptions {
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

  addSubMenuHelp(): MenuItemConstructorOptions {
    return {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click() {
          shell.openExternal('https://electronjs.org');
        },
      }, {
        label: 'Documentation',
        click() {
          shell.openExternal(
            'https://github.com/electron/electron/tree/main/docs#readme'
          );
        },
      }, {
        label: 'Community Discussions',
        click() {
          shell.openExternal('https://www.electronjs.org/community');
        },
      }, {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/electron/electron/issues');
        },
      }]
    };
  }

}
