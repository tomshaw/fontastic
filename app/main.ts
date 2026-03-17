import {
  app,
  BrowserWindow,
  ipcMain,
  nativeImage,
  nativeTheme,
  net,
  powerMonitor,
  protocol,
  screen,
  session,
  systemPreferences,
} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { machineId } from 'node-machine-id';
import Application from './Application';
import { ChannelType } from './enums/ChannelType';
import type { NativeThemeState, SystemPreferencesState } from './types';

app.name = 'Fontastic';

const iconPath = path.join(__dirname, '..', 'src', 'assets', 'icons', 'favicon.512x512.png');

app.setAboutPanelOptions({
  applicationName: 'Fontastic',
  applicationVersion: app.getVersion(),
  iconPath,
});

let win: BrowserWindow | null = null;
let resolveAppReady: () => void;
const appReadyPromise = new Promise<void>((resolve) => {
  resolveAppReady = resolve;
});

const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

// --- Native Theme ---

function getNativeThemeState(): NativeThemeState {
  return {
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    themeSource: nativeTheme.themeSource,
  };
}

ipcMain.handle(ChannelType.IPC_GET_NATIVE_THEME, () => getNativeThemeState());

nativeTheme.on('updated', () => {
  if (win && !win.isDestroyed()) {
    win.webContents.send(ChannelType.IPC_NATIVE_THEME_CHANGED, getNativeThemeState());
  }
});

// --- System Preferences ---

function getSystemPreferencesState(): SystemPreferencesState {
  let reduceMotion = false;
  if (process.platform === 'darwin') {
    reduceMotion = systemPreferences.getAnimationSettings().prefersReducedMotion;
  }

  return {
    accentColor: systemPreferences.getAccentColor?.() ?? '',
    reduceMotion,
  };
}

ipcMain.handle(ChannelType.IPC_GET_SYSTEM_PREFERENCES, () => getSystemPreferencesState());

function createWindow(): BrowserWindow {
  const size = screen.getPrimaryDisplay().workAreaSize;

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
      webSecurity: !serve,
    },
  });

  machineId(true).then((machineId: string) => new Application(machineId, !serve, win!).initialize().then(() => resolveAppReady()));

  if (serve) {
    import('electron-debug').then((debug) => {
      debug.default({ isEnabled: true, showDevTools: true });
    });

    import('electron-reloader').then((reloader) => {
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
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'font',
      privileges: { bypassCSP: true, supportFetchAPI: true },
    },
  ]);

  ipcMain.handle('app:get-version', () => app.getVersion());
  ipcMain.handle('app:ready', () => appReadyPromise);

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    protocol.handle('font', async (request) => {
      const filePath = decodeURIComponent(request.url.replace('font://', ''));
      try {
        return await net.fetch(`file://${filePath}`);
      } catch {
        return new Response('Not found', { status: 404 });
      }
    });

    // --- Session: deny unnecessary permissions ---
    session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
      const allowed = ['clipboard-read', 'clipboard-sanitized-write'];
      callback(allowed.includes(permission));
    });

    // --- Session: set CSP in production ---
    if (!serve) {
      session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': [
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' font:; img-src 'self' data: https:;",
            ],
          },
        });
      });
    }

    // --- Power Monitor ---
    powerMonitor.on('suspend', () => {
      if (win && !win.isDestroyed()) {
        win.webContents.send(ChannelType.IPC_POWER_SUSPEND);
      }
    });

    powerMonitor.on('resume', () => {
      if (win && !win.isDestroyed()) {
        win.webContents.send(ChannelType.IPC_POWER_RESUME);
      }
    });

    powerMonitor.on('shutdown', () => {
      if (win && !win.isDestroyed()) {
        win.webContents.send(ChannelType.IPC_POWER_SHUTDOWN);
      }
    });

    powerMonitor.on('lock-screen', () => {
      if (win && !win.isDestroyed()) {
        win.webContents.send(ChannelType.IPC_POWER_LOCK_SCREEN);
      }
    });

    setTimeout(createWindow, 400);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
