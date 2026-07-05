import { Injectable } from '@angular/core';
import type { FontasticBridge } from '@main/types';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  /** The typed IPC bridge exposed by the preload script, or undefined in a plain browser. */
  readonly bridge?: FontasticBridge = (window as any).fontastic;

  /** Resolves when the main process signals that IPC handlers and DB are ready. */
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.bridge ? this.bridge.invoke<void>('app:ready') : Promise.resolve();
  }

  get isElectron(): boolean {
    return !!this.bridge;
  }
}
