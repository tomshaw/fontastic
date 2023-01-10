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
    this.systemManager = systemManager;
    this.connectionManager = connectionManager;
  }

  async activate(args: any) {
    const fonts = (args.files && args.files.length) ? args.files : [];
    const temporary = (args.temporary && args.temporary === true) ? true : false;
    const activate = (args.activate && args.activate === true) ? 1 : 0;

    if (args.collectionId) {
      let collectionId = parseInt(args.collectionId);
      let results = await this.connectionManager.getStore().find({ where: { collection_id: collectionId } });
      return await this.run({ files: results, activate, temporary }).then(() => {
        if (temporary) {
          this.connectionManager.getStoreRepository().temporaryCollection(collectionId, activate);
        } else {
          this.connectionManager.getStoreRepository().activateCollection(collectionId, activate);
        }
      });
    } else {
      return await this.run(args).then(() => {
        let ids = fonts.map((item: any) => item.id);
        if (temporary) {
          this.connectionManager.getStoreRepository().temporaryByIds(ids, activate);
        } else {
          this.connectionManager.getStoreRepository().activateByIds(ids, activate);
        }
      });
    }
  }

  async run(args: any) {
    const platform = this.systemManager.getPlatform();
    const executable = this.systemManager.getExecutable();

    const activate = (args.activate) ? 'install' : 'uninstall';
    const temporary = (platform === "win" && args.temporary && args.temporary === true) ? '--temporary=true' : '--temporary=false';
    const files = args.files.map((item: any) => `"${path.normalize(item.file_path)}"`).join(" ");

    const command = `${executable} ${activate} ${temporary} ${files}`;

    if (platform === 'win') {
      return prompt(command, { name: "Font Activation" });
    } else {
      return execute(command);
    }
  }
}
