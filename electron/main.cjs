const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;

// Handle deep links on Windows (register protocol)
if (!app.isDefaultProtocolClient('natprep')) {
  app.setAsDefaultProtocolClient('natprep');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "NAT Prep",
    icon: path.join(__dirname, '../public/logo.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, 'preload.cjs')
    }
  });

  mainWindow.setMenu(null);

  if (isDev) {
    const loadDevServer = () => {
      // LOCKED to 5173 for consistency
      mainWindow.loadURL('http://127.0.0.1:5173').catch(() => {
        console.log('Dev server at 5173 not ready, retrying...');
        setTimeout(loadDevServer, 1000);
      });
    };
    loadDevServer();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      const url = commandLine.pop();
      if (url.includes('natprep://')) mainWindow.webContents.send('deep-link', url);
    }
  });
  app.whenReady().then(createWindow);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  if (mainWindow) mainWindow.webContents.send('deep-link', url);
});

const { ipcMain } = require('electron');
ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});
