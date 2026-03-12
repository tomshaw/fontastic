import { app, Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { ChannelType } from '../../../enums';

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

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow];
  }

  addSubMenuAbout(): MenuItemConstructorOptions | DarwinMenuItemConstructorOptions {
    return {
      label: 'Fontastic',
      submenu: [
        {
          label: 'About Fontastic',
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        {
          label: 'Hide Fontastic',
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
        { label: 'Select All', accelerator: 'Command+A', selector: 'selectAll:' },
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
        accelerator: 'Alt+Command+E',
        click: () => {
          this.mainWindow.webContents.send(ChannelType.IPC_TOGGLE_PANEL, 'expand-collections');
        },
      },
      {
        label: 'Collapse Collections',
        accelerator: 'Alt+Command+Shift+E',
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

  addSubMenuWindow(): DarwinMenuItemConstructorOptions {
    return {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'Command+M', selector: 'performMiniaturize:' },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
        { type: 'separator' },
        ...this.addTogglePanelItems(),
      ],
    };
  }

  addTogglePanelItems(): MenuItemConstructorOptions[] {
    const panels: { label: string; panel: string; accelerator: string }[] = [
      { label: 'Toggle Navigation', panel: 'navigation', accelerator: 'Alt+Command+1' },
      { label: 'Toggle Aside', panel: 'aside', accelerator: 'Alt+Command+2' },
      { label: 'Toggle Preview', panel: 'preview', accelerator: 'Alt+Command+3' },
      { label: 'Toggle Glyphs', panel: 'glyphs', accelerator: 'Alt+Command+4' },
      { label: 'Toggle Toolbar', panel: 'toolbar', accelerator: 'Alt+Command+5' },
      { label: 'Toggle Grid', panel: 'grid', accelerator: 'Alt+Command+6' },
      { label: 'Toggle Waterfall', panel: 'waterfall', accelerator: 'Alt+Command+7' },
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
