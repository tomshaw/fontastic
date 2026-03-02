import ConnectionManager from "./ConnectionManager";
import FontObject from "./FontObject";
import * as fs from "fs";
import * as path from "path";
import { installable } from "../config/mimes";

const prettyBytes = require("pretty-bytes");
const mime = require("mime");

// https://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object

export default class FileSystem {

  connectionManager: ConnectionManager;

  counter: number = 0;
  errors: any[] = [];
  found: any[] = [];

  constructor(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;

    this.counter = 0;
    this.errors = [];
  }

  setCounter(count: number): void {
    this.counter = count;
  }

  getCounter(): number {
    return this.counter;
  }

  scanFolders(dir: any, options: any, done: any) {
    fs.readdir(dir, (err: any, list: any) => {
      if (err) return done(err);
      let i = 0;
      let next = () => {
        let file = list[i++];
        if (!file) return done(null, this);
        let fp = path.resolve(dir, file);
        fs.stat(fp, async (err: any, stat: any) => {
          if (stat && stat.isDirectory()) {
            this.scanFolders(fp, options, (err: any, res: any) => next());
          } else {
            this.fontInstall(fp, stat, options);
            next();
          }
        });
      };
      next();
    });
  }

  scanFiles(files: any, options: any, done: any) {
    files.forEach(async (fp: any) => {
      let stat = fs.statSync(fp);
      if (stat.isFile()) {
        this.fontInstall(fp, stat, options);
      }
    });

    return done(null, this);
  }

  fontInstall(fp: any, stat: any, options: any) {
    let font = new FontObject(fp);

    if (font.hasError()) {
      this.errors.push(font.getError());
    } else {

      let fileSize = stat.size;
      let fileType = mime.getType(fp);

      let data: any = {
        file_path: fp,
        file_name: path.basename(fp),
        file_size: fileSize,
        file_size_pretty: prettyBytes(fileSize),
        file_type: fileType,
        installable: installable.includes(fileType),
        ...options
      }

      try {
        this.connectionManager.getStoreRepository().create({ ...data, ...font.getNamesTable() });
      } catch(err) {
        this.errors.push(err.message);
      }

      this.counter++;
    }
  }
}
