import ConnectionManager from './ConnectionManager';
import FontObject from "./FontObject";
import * as fs from 'fs';
import * as path from 'path';
import { installable } from '../config/mimes';

const prettyBytes = require('pretty-bytes');
const mime = require('mime');

export default class FileSystem {

  connectionManager: ConnectionManager;

  counter: number = 0;
  errors: any[] = [];

  constructor(connectionManager: ConnectionManager) {
    this.setConnectionManager(connectionManager);

    this.counter = 0;
    this.errors = [];
  }

  setConnectionManager(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;
  }

  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
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

            let font = new FontObject(fp);

            if (font.hasError()) {
              this.errors.push(font.getError())
            } else {

              let fileSize = stat.size;
              let fileType = mime.getType(fp);

              let data: any = {
                file_path: fp,
                file_name: file,
                file_size: fileSize,
                file_size_pretty: prettyBytes(fileSize),
                file_type: fileType,
                installable: installable.includes(fileType),
                ...options,
              }

              this.getConnectionManager().getStoreRepository().create({ ...data, ...font.getNamesTable() });

              this.counter++;
            }
            next();
          }
        });
      };
      next();
    });
  }

  scanFiles(dir: any, options: any, done: any) {
    dir.forEach(async (fp: any) => {
      let stat = fs.statSync(fp);
      if (stat.isFile()) {

        let font = new FontObject(fp);

        if (font.hasError()) {
          this.errors.push(font.getError())
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

          this.getConnectionManager().getStoreRepository().create({ ...data, ...font.getNamesTable() });

          this.counter++;
        }
      }
    });

    return done(null, this);
  }
}
