import SystemManager from "./SystemManager";
import ConnectionManager from "./ConnectionManager";
import AppLogger from "./AppLogger"
import { prompt } from "../helpers/command"

const path = require("path");

export default class FontInstaller {

  systemManager: SystemManager;
  connectionManager: ConnectionManager;

  constructor(
    systemManager: SystemManager,
    connectionManager: ConnectionManager
  ) {
    this.setSystemManager(systemManager);
    this.setConnectionManager(connectionManager);
  }

  setSystemManager(systemManager: SystemManager) {
    this.systemManager = systemManager;
  }

  getSystemManager(): SystemManager {
    return this.systemManager;
  }

  setConnectionManager(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;
  }

  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  async activate(args: any, done: any) {
    const fonts = (args.files && args.files.length) ? args.files : [];
    const temporary = (args.temporary && args.temporary === true) ? true : false;
    const activate = (args.activate && args.activate === true) ? 1 : 0;

    if (args.collectionId) {
      let collectionId = parseInt(args.collectionId);

      let results = await this.getConnectionManager().getStore().find({ where: { collection_id: collectionId } });

      await this.activationCommand({ files: results, activate, temporary }).then((result: any) => {
        if (result.stderr) {
          return done({ errors: result.stderr })
        } else if (result.stdout) {
          if (temporary) {
            this.getConnectionManager().getStoreRepository().temporaryCollection(collectionId, activate);
          } else {
            this.getConnectionManager().getStoreRepository().activateCollection(collectionId, activate);
          }
          return done({ result: result.stdout })
        } else {
          return done({ errors: result })
        }
      }).catch((err) => {
        return done({ errors: err.message })
      });

    } else {
      await this.activationCommand(args).then((result: any) => {
        AppLogger.getInstance('default').info(result);
        if (result.stderr) {
          return done({ errors: result.stderr })
        } else if (result.stdout) {
          let ids = fonts.map((item: any) => item.id);
          if (temporary) {
            this.getConnectionManager().getStoreRepository().temporaryByIds(ids, activate);
          } else {
            this.getConnectionManager().getStoreRepository().activateByIds(ids, activate);
          }
          return done({ result: result.stdout })
        } else {
          return done({ errors: result })
        }
      }).catch((err) => {
        return done({ errors: err.message })
      });
    }
  }

  async activationCommand(args: any) {
    const executable = this.getSystemManager().getBinaryName()
    const cmdPath = this.getSystemManager().getBinaryPath(executable);

    const activate = (args.activate) ? 'install' : 'uninstall';
    const temporary = (this.getSystemManager().getPlatform() === "win" && args.temporary && args.temporary === true) ? '--temporary=true' : '--temporary=false';
    const files = args.files.map((item: any) => `"${path.normalize(item.file_path)}"`).join(" ");

    const command = `${cmdPath} ${activate} ${temporary} ${files}`;

    AppLogger.getInstance('default').info(command);

    try {
      return await prompt(command, { name: "Font Activation" });
    } catch (err) {
      return err;
    }
  }
}
