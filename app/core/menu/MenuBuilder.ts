import { Menu, BrowserWindow } from 'electron';
import DarwinTemplate from './templates/DarwinTemplate';
import SystemTemplate from './templates/SystemTemplate';

export default class MenuBuilder {
  mainWindow: BrowserWindow;
  isProduction: boolean;
  isProductionReady = false;

  constructor(mainWindow: BrowserWindow, isProduction: boolean) {
    this.mainWindow = mainWindow;
    this.isProduction = isProduction;

    if (!this.isProduction) {
      this.buildContextMenu();
    }
  }

  buildContextMenu(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;
      Menu.buildFromTemplate([{
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

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  buildDarwinTemplate() {
    const template = new DarwinTemplate(this.mainWindow, this.isProduction);
    return template.build();
  }

  buildDefaultTemplate() {
    const template = new SystemTemplate(this.mainWindow, this.isProduction);
    return template.build();
  }
}
