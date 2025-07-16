import { app, BrowserWindow, ipcMain, Menu, session, shell } from "electron";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";
import log from 'electron-log';
import { createDatabase } from "./electronUtils/db.js";
import { registerIpcHandlers } from "./electronUtils/ipcHandlers.js";

// Setting up logging
// 1) Set the log file path to the user data directory
log.transports.file.resolvePath = () =>
  join(app.getPath('userData'), 'logs', 'main.log');

// 2) Redirect all console.* calls to electron-log:
if (process.env.NODE_ENV !== 'development') {
  Object.assign(console, log.functions);
  // 3) Catch uncaught exceptions and unhandled rejections:
  log.catchErrors({
    showDialog: false,    // don’t pop up dialogs
    onError(error) { /* … */ }
  });
} // This is needed to make the chrome console to know the correct references in development mode

log.initialize();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

const os = process.platform;


// Change the expected executable name based on the OS
const steamCmdExeExec = os === "win32" ? "steamcmd.exe" : os === "linux" ? "steamcmd.sh" : "steamcmd";
console.log(os, steamCmdExeExec)

// Sets the path to the icon for each os.
let iconPath = ''
if (os === 'win32') {
  iconPath = __dirname + "/assets/UniworkshopIcon_textless.ico";
} else if (os === 'linux') {
  iconPath = __dirname + "/assets/UniworkshopIcon_textless.png";
}

console.log('Using preload path:', path.join(__dirname, 'preload.cjs'));

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.cjs'), 
      webviewTag: false,
    },
    icon: iconPath,
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load preload script:', errorDescription);
  });

  // Set the user agent to block a lot of content (security reasons)
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';         img-src       *      data:; connect-src 'self' https://steamcommunity.com; frame-src https://steamcommunity.com; object-src 'none';"
        ]
      }
    });
  });

  // Catch “target=_blank” and window.open() calls
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Catch any in-page navigation (e.g. <a href> without target or JS redirects)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const origin = new URL(mainWindow.webContents.getURL()).origin;
    if (new URL(url).origin !== origin) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  if (process.env.NODE_ENV === "development") {
    // Load from Vite server during development
    mainWindow.loadURL("http://localhost:5173");
    console.log("dev-mode");
  } else {
    // Load the built version in production

    // Set an empty application menu
    const menu = Menu.buildFromTemplate([]);
    Menu.setApplicationMenu(menu);

    mainWindow.loadFile(__dirname + "/dist/index.html");
    console.log("build-mode");
  }
}

// Create the main application window
app.whenReady().then(() => {
  if (app.isPackaged) {  // Don't set CSP in development mode
    // Set the Content Security Policy (CSP) for the application
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self' https://api.steampowered.com https://store.steampowered.com",
      "object-src 'none'",
      "base-uri 'none'"
    ].join('; ');

    session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
      cb({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [csp]
        }
      });
    });
  };

  registerIpcHandlers();
  createDatabase();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});