import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer!: typeof ipcRenderer;
  webFrame!: typeof webFrame;
  childProcess!: typeof childProcess;
  fs!: typeof fs;
  store: any;

  constructor() {
    if (this.isElectron) {
      this.ipcRenderer = (window as any).require('electron').ipcRenderer;
      this.webFrame = (window as any).require('electron').webFrame;
      this.childProcess = (window as any).require('child_process');
      this.fs = (window as any).require('fs');

      const Store = (window as any).require('electron-store');
      this.store = new Store();
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  getStore() {
    return this.store;
  }
}
