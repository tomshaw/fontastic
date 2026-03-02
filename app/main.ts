import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { machineId } from 'node-machine-id';

import Application from './Application';

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

async function createWindow(): Promise<BrowserWindow> {

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Initialize Application and IPC handlers BEFORE loading the renderer
  const id = await machineId(true);
  new Application(id, !serve);

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,
      webSecurity: !serve
    },
  });

  if (serve) {
    import('electron-debug').then(debug => {
      debug.default({isEnabled: true, showDevTools: true});
    });

    import('electron-reloader').then(reloader => {
      const reloaderFn = (reloader as any).default || reloader;
      // watchRenderer: false — Angular dev server handles HMR for the renderer.
      // Without this, reloader triggers spurious reloads on macOS (issue #840).
      reloaderFn(module, { watchRenderer: false });
    });
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './browser/index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/browser/index.html'))) {
       // Path when running electron in local folder
      pathIndex = '../dist/browser/index.html';
    }

    const fullPath = path.join(__dirname, pathIndex);
    const url = `file://${path.resolve(fullPath).replace(/\\/g, '/')}`;
    win.loadURL(url);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null;
  });

  return win;
}

try {
  ipcMain.handle('app:get-version', () => app.getVersion());

  // Added 400 ms to fix the black background issue while using transparent window.
  // More details at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
}
