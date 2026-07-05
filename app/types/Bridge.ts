/**
 * The typed API exposed to the renderer by app/preload.ts via contextBridge.
 * Available in the renderer as `window.fontastic`.
 */
export interface FontasticBridge {
  versions: {
    app: string;
    electron: string;
    chrome: string;
    node: string;
  };
  invoke<T = unknown>(channel: string, args?: unknown): Promise<T>;
  send(channel: string, args?: unknown): void;
  once(channel: string, listener: (...args: any[]) => void): void;
  /** Subscribes and returns a subscription id for `off()`. */
  on(channel: string, listener: (...args: any[]) => void): number;
  off(subscriptionId: number): void;
  removeAllListeners(channel: string): void;
}
