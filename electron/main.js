'use strict';

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');

// Set DATA_DIR before server.js / db.js are required so SQLite opens
// in the user's app-data folder (survives app updates, not inside the bundle).
process.env.DATA_DIR = path.join(app.getPath('userData'), 'data');

let mainWindow = null;

// Poll localhost:3000 until the Express server is accepting connections.
function waitForServer(retriesLeft, cb) {
  http.get('http://localhost:3000', () => cb(null))
    .on('error', () => {
      if (retriesLeft <= 0) return cb(new Error('Server failed to start'));
      setTimeout(() => waitForServer(retriesLeft - 1, cb), 300);
    });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'FinPal',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  // Open links that target a new tab in the system browser instead of Electron.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  // Require the Express server — it calls app.listen() immediately.
  require('../server');

  // Wait up to ~9 seconds (30 × 300 ms) for the server to be ready.
  waitForServer(30, (err) => {
    if (err) {
      console.error('FinPal: server did not start —', err.message);
      app.quit();
      return;
    }
    createWindow();
  });
});

// Quit when all windows are closed (Windows / Linux behaviour).
// On macOS the app stays active until the user quits explicitly.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // Re-open the window on macOS when the dock icon is clicked and no windows are open.
  if (mainWindow === null) createWindow();
});
