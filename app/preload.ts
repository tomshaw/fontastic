import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// NOTE: This file runs in the sandboxed preload context. It must stay
// self-contained — sandboxed preloads cannot require local modules, so the
// scan-progress channel name is duplicated here rather than imported.
const SCAN_PROGRESS_PORT_CHANNEL = 'IPC_SCAN_PROGRESS_PORT';

type Listener = (...args: unknown[]) => void;

let nextSubscriptionId = 0;
const subscriptions = new Map<number, { channel: string; wrapped: (event: IpcRendererEvent, ...args: unknown[]) => void }>();

// MessagePorts cannot cross the context bridge directly; forward them into
// the isolated world through window.postMessage, which supports transferables.
ipcRenderer.on(SCAN_PROGRESS_PORT_CHANNEL, (event) => {
  window.postMessage({ type: SCAN_PROGRESS_PORT_CHANNEL }, '*', event.ports);
});

contextBridge.exposeInMainWorld('fontastic', {
  versions: {
    app: '',
    electron: process.versions.electron ?? '',
    chrome: process.versions.chrome ?? '',
    node: process.versions.node ?? '',
  },

  invoke: (channel: string, args?: unknown): Promise<unknown> => ipcRenderer.invoke(channel, args),

  send: (channel: string, args?: unknown): void => ipcRenderer.send(channel, args),

  once: (channel: string, listener: Listener): void => {
    ipcRenderer.once(channel, (_event, ...args) => listener(...args));
  },

  on: (channel: string, listener: Listener): number => {
    const wrapped = (_event: IpcRendererEvent, ...args: unknown[]) => listener(...args);
    const id = ++nextSubscriptionId;
    subscriptions.set(id, { channel, wrapped });
    ipcRenderer.on(channel, wrapped);
    return id;
  },

  off: (subscriptionId: number): void => {
    const sub = subscriptions.get(subscriptionId);
    if (sub) {
      ipcRenderer.removeListener(sub.channel, sub.wrapped);
      subscriptions.delete(subscriptionId);
    }
  },

  removeAllListeners: (channel: string): void => {
    for (const [id, sub] of subscriptions) {
      if (sub.channel === channel) {
        subscriptions.delete(id);
      }
    }
    ipcRenderer.removeAllListeners(channel);
  },
});
