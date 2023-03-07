import SystemManager from './SystemManager';
import * as fs from 'fs/promises';

const path = require('path');
const exec = require('child_process').exec;
const child = require('child_process').execFile;

export default class FontCatalog {

  systemManager: SystemManager;

  constructor(
    systemManager: SystemManager,
  ) {
    this.systemManager = systemManager;
  }

  async createCatalog(folder: string): Promise<string> {
    return await fs.mkdir(folder, { recursive: true });
  }

  async commandHelp(done: any) {
    return await child(this.systemManager.getExecutable(), ['-h'], done);
  }

  async findFonts(src: string, done: any) {
    return await child(this.systemManager.getExecutable(), ['fonts', 'find', '--root', src], done);
  }

  async copyFiles(files: any, dest: string, done: any) {
    const cmdPath = this.systemManager.getExecutable();
    const items = files.map((item: string) => `"${path.normalize(item)}"`).join(" ");
    const command = `${cmdPath} copy files --destination "${dest}" ${items}`;
    return exec(command, done);
  }

  async copyFolders(src: string, dest: string, done: any) {
    const params = ['copy', 'folders', '--source', src, '--destination', dest];

    return child(this.systemManager.getExecutable(), params, done);
  }
}
