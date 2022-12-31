import SystemManager from "./SystemManager";
import ConnectionManager from "./ConnectionManager";
import { prompt, execute } from "../helpers/command"

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

  async activate(args: any) {
    const fonts = (args.files && args.files.length) ? args.files : [];
    const temporary = (args.temporary && args.temporary === true) ? true : false;
    const activate = (args.activate && args.activate === true) ? 1 : 0;

    if (args.collectionId) {
      let collectionId = parseInt(args.collectionId);
      let results = await this.getConnectionManager().getStore().find({ where: { collection_id: collectionId } });
      return await this.run({ files: results, activate, temporary }).then((result: any) => {
        if (temporary) {
          this.getConnectionManager().getStoreRepository().temporaryCollection(collectionId, activate);
        } else {
          this.getConnectionManager().getStoreRepository().activateCollection(collectionId, activate);
        }
      });
    } else {
      return await this.run(args).then((result: any) => {
        let ids = fonts.map((item: any) => item.id);
        if (temporary) {
          this.getConnectionManager().getStoreRepository().temporaryByIds(ids, activate);
        } else {
          this.getConnectionManager().getStoreRepository().activateByIds(ids, activate);
        }
      });
    }
  }

  async run(args: any) {
    const platform = this.getSystemManager().getPlatform();
    const executable = this.getSystemManager().getBinaryName()
    const cmdPath = this.getSystemManager().getBinaryPath(executable);

    const activate = (args.activate) ? 'install' : 'uninstall';
    const temporary = (this.getSystemManager().getPlatform() === "win" && args.temporary && args.temporary === true) ? '--temporary=true' : '--temporary=false';
    const files = args.files.map((item: any) => `"${path.normalize(item.file_path)}"`).join(" ");

    const command = `${cmdPath} ${activate} ${temporary} ${files}`;

    if (platform === 'unix') {
      return execute(command);
    } else if (platform === 'win') {
      return prompt(command, { name: "Font Activation" });
    }
  }
}
