import * as fs from 'fs/promises';
import * as path from 'path';

export default class FontCatalog {

  async createCatalog(folder: string): Promise<string> {
    return await fs.mkdir(folder, { recursive: true });
  }

  async copyFiles(files: string[], dest: string): Promise<void> {
    await this.createCatalog(dest);
    await Promise.all(
      files.map(file => fs.copyFile(file, path.join(dest, path.basename(file))))
    );
  }

  async copyFolder(src: string, dest: string): Promise<void> {
    await fs.cp(src, dest, { recursive: true });
  }
}
