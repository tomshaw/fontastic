import { app, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { ChannelType } from '../../../enums';

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

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow];
  }

  addSubMenuAbout(): MenuItemConstructorOptions {
    return {
      label: 'Fontastic',
      submenu: [
        {
          label: 'About Fontastic',
        },
        { type: 'separator' },
        {
          label: 'Hide Fontastic',
          accelerator: 'Command+H',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
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
        { label: 'Select All', accelerator: 'Command+A' },
      ],
    };
  }

  addSubMenuView(): MenuItemConstructorOptions {
    const items: MenuItemConstructorOptions[] = [
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => {
          this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
        },
      },
      { type: 'separator' },
      {
        label: 'Expand Collections',
        accelerator: 'Alt+Ctrl+E',
        click: () => {
          this.mainWindow.webContents.send(ChannelType.IPC_TOGGLE_PANEL, 'expand-collections');
        },
      },
      {
        label: 'Collapse Collections',
        accelerator: 'Alt+Ctrl+Shift+E',
        click: () => {
          this.mainWindow.webContents.send(ChannelType.IPC_TOGGLE_PANEL, 'collapse-collections');
        },
      },
    ];

    if (!this.isProduction) {
      items.push(
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      );
    }

    return {
      label: 'View',
      submenu: items,
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
        { type: 'separator' },
        ...this.addTogglePanelItems(),
      ],
    };
  }

  addTogglePanelItems(): MenuItemConstructorOptions[] {
    const panels: { label: string; panel: string; accelerator: string }[] = [
      { label: 'Toggle Navigation', panel: 'navigation', accelerator: 'Alt+Ctrl+1' },
      { label: 'Toggle Aside', panel: 'aside', accelerator: 'Alt+Ctrl+2' },
      { label: 'Toggle Preview', panel: 'preview', accelerator: 'Alt+Ctrl+3' },
      { label: 'Toggle Glyphs', panel: 'glyphs', accelerator: 'Alt+Ctrl+4' },
      { label: 'Toggle Toolbar', panel: 'toolbar', accelerator: 'Alt+Ctrl+5' },
      { label: 'Toggle Grid', panel: 'grid', accelerator: 'Alt+Ctrl+6' },
      { label: 'Toggle Waterfall', panel: 'waterfall', accelerator: 'Alt+Ctrl+7' },
    ];

    return panels.map(({ label, panel, accelerator }) => ({
      label,
      accelerator,
      click: () => {
        this.mainWindow.webContents.send(ChannelType.IPC_TOGGLE_PANEL, panel);
      },
    }));
  }
}
