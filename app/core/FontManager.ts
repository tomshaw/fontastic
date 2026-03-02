import { dialog, BrowserWindow, shell } from 'electron';

import SystemManager from "./SystemManager";
import ConfigManager from "./ConfigManager";
import ConnectionManager from './ConnectionManager';
import FontFinder from './FontFinder';

import { exec } from 'child_process';

const sudo = require('sudo-prompt');

export default class FontManager {

  systemManager: SystemManager;
  configManager: ConfigManager;
  connectionManager: ConnectionManager;

  constructor(systemManager: SystemManager, configManager: ConfigManager, connectionManager: ConnectionManager) {
    this.setSystemManager(systemManager);
    this.setConfigManager(configManager);
    this.setConnectionManager(connectionManager);
  }

  setSystemManager(systemManager: SystemManager) {
    this.systemManager = systemManager;
  }

  getSystemManager(): SystemManager {
    return this.systemManager;
  }

  setConfigManager(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  getConfigManager(): ConfigManager {
    return this.configManager;
  }

  setConnectionManager(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;
  }

  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  scanFiles(dir: any, options: any, done: any) {
    let finder = new FontFinder(this.getConnectionManager());
    return finder.scanFiles(dir, options, done);
  }

  scanFolders(dir: any, options: any, done: any) {
    let finder = new FontFinder(this.getConnectionManager());
    return finder.scanFolders(dir, options, done);
  }

  async exec(cmd: string, options = {}) {
    return new Promise((resolve, reject) => {
      exec(cmd, options, (err: any, stdout: any, stderr: any) => {
        if (err) { return reject(err); }
        return resolve({ stdout, stderr });
      });
    });
  }

  async sudo(cmd: string, options = {}) {
    return new Promise((resolve, reject) => {
      sudo.exec(cmd, options, (err: any, stdout: any, stderr: any) => {
        if (err) { return reject(err); }
        return resolve({ stdout, stderr });
      });
    });
  }

  async executeCommand(args: any) {
    try {
      return await this.exec(args.cmd, args.options);
    } catch (err) {
      return err;
    }
  }

  fontInstallation() {
    // const collectionId = (args.collectionId) ? parseInt(args.collectionId) : false;
    // const temporary = (args.temporary && args.temporary === true) ? true : false;
    // const activate = (args.activate && args.activate === true) ? 1 : 0;
    // const connection = this.getConnection();
    // const fonts = (args.files && args.files.length) ? args.files : [];

    // if (collectionId) {
    //   connection.getRepository(Store).find({ collection_id: collectionId }).then(async (result: any[] = []) => {
    //     await fontManager.activationCommand({ files: result, activate, temporary }).then((result) => {
    //       if (result.stderr) {
    //         event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: result.stderr });
    //       } else if (result.stdout) {
    //         if (temporary) {
    //           connection.getCustomRepository(StoreRepository).temporaryCollection(collectionId, activate);
    //         } else {
    //           connection.getCustomRepository(StoreRepository).activateCollection(collectionId, activate);
    //         }
    //         event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { success: true });
    //       } else {
    //         event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: 'Request was not processed.' });
    //       }
    //     }).catch((err) => {
    //       event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: err.message });
    //     });
    //   })
    // } else {
    //   await fontManager.activationCommand(args).then((result) => {
    //     if (result.stderr) {
    //       event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: result.stderr });
    //     } else if (result.stdout) {
    //       let ids = [];
    //       fonts.forEach((item: any) => {
    //         ids.push(item.id)
    //       });
    //       if (temporary) {
    //         connection.getCustomRepository(StoreRepository).temporaryByIds(ids, activate);
    //       } else {
    //         connection.getCustomRepository(StoreRepository).activateByIds(ids, activate);
    //       }
    //       event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { success: true });
    //     } else {
    //       event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: 'Request was not processed.' });
    //     }
    //   }).catch((err) => {
    //     event.sender.send(channel.IPCMAIN_RESPONSE_FONT_ACTIVATION, { errors: err.message });
    //   });
    // }
  }

  async activationCommand(args: any) {
    let executable = this.getSystemManager().getBinaryName()
    let cmdPath = this.getSystemManager().getBinaryPath(executable);

    let temp = (this.systemManager.getPlatform() === 'win' && args.temporary && args.temporary === true) ? true : false;

    let files = [];
    for (let i = 0, total = args.files.length; i < total; i++) {
      let normalized = this.systemManager.normalizePath(args.files[i].file_path);
      files.push(`"${normalized}"`);
    }
    files.join(' ');

    let command = `${cmdPath} -activate=${args.activate} -temp=${temp} ${files}`;

    try {
      return await this.sudo(command, { name: 'Font Activation' });
    } catch (err) {
      return err;
    }
  }

  showDialogBox(options: any) {
    return dialog.showMessageBox(null, options);
  }

  showOpenDialog(options: any) {
    return dialog.showOpenDialog(options);
  }

  beep() {
    return shell.beep()
  }

  openPath(path: string) {
    shell.openPath(path)
  }

  openExternal(url: string) {
    shell.openExternal(url)
  }

  showItemInFolder(fullPath: string) {
    shell.showItemInFolder(fullPath);
  }

  reloadWindow() {
    const windows = BrowserWindow.getAllWindows();
    if (windows && windows.length) {
      for (const win of windows) {
        win.webContents.reloadIgnoringCache();
      }
    }
  }
}
