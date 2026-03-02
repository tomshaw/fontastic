import {
  app,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';

export default class SystemTemplate {
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

  addSubMenuAbout(): MenuItemConstructorOptions {
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
          app.quit();
        },
      },
      ],
    };
  }

  addSubMenuEdit(): MenuItemConstructorOptions {
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

  addSubMenuWindow(): MenuItemConstructorOptions {
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
