"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// NOTE: This file runs in the sandboxed preload context. It must stay
// self-contained — sandboxed preloads cannot require local modules, so the
// scan-progress channel name is duplicated here rather than imported.
const SCAN_PROGRESS_PORT_CHANNEL = 'IPC_SCAN_PROGRESS_PORT';
let nextSubscriptionId = 0;
const subscriptions = new Map();
// MessagePorts cannot cross the context bridge directly; forward them into
// the isolated world through window.postMessage, which supports transferables.
electron_1.ipcRenderer.on(SCAN_PROGRESS_PORT_CHANNEL, (event) => {
    window.postMessage({ type: SCAN_PROGRESS_PORT_CHANNEL }, '*', event.ports);
});
electron_1.contextBridge.exposeInMainWorld('fontastic', {
    versions: {
        app: '',
        electron: (_a = process.versions.electron) !== null && _a !== void 0 ? _a : '',
        chrome: (_b = process.versions.chrome) !== null && _b !== void 0 ? _b : '',
        node: (_c = process.versions.node) !== null && _c !== void 0 ? _c : '',
    },
    invoke: (channel, args) => electron_1.ipcRenderer.invoke(channel, args),
    send: (channel, args) => electron_1.ipcRenderer.send(channel, args),
    once: (channel, listener) => {
        electron_1.ipcRenderer.once(channel, (_event, ...args) => listener(...args));
    },
    on: (channel, listener) => {
        const wrapped = (_event, ...args) => listener(...args);
        const id = ++nextSubscriptionId;
        subscriptions.set(id, { channel, wrapped });
        electron_1.ipcRenderer.on(channel, wrapped);
        return id;
    },
    off: (subscriptionId) => {
        const sub = subscriptions.get(subscriptionId);
        if (sub) {
            electron_1.ipcRenderer.removeListener(sub.channel, sub.wrapped);
            subscriptions.delete(subscriptionId);
        }
    },
    removeAllListeners: (channel) => {
        for (const [id, sub] of subscriptions) {
            if (sub.channel === channel) {
                subscriptions.delete(id);
            }
        }
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
});
//# sourceMappingURL=preload.js.map