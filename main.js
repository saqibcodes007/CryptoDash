// main.js - Final Corrected Version

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

function createLoginWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 650,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.loadFile('index.html');
}

function createDashboardWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // More secure
            contextIsolation: true,
        }
    });
    mainWindow.loadFile('dashboard.html');
    // Forces the developer console to open for debugging
    mainWindow.webContents.openDevTools();
}

function getPositionsFromPython(apiKey, apiSecret, baseUrl) {
  return new Promise((resolve, reject) => {
    if (!apiKey || !apiSecret || !baseUrl) {
        return reject('API Key, Secret, or Base URL is missing.');
    }
    const pythonExecutable = process.platform === 'win32'
      ? path.join(__dirname, 'venv/Scripts/python.exe')
      : path.join(__dirname, 'venv/bin/python');

    const pythonProcess = spawn(pythonExecutable, [
      path.join(__dirname, 'backend/api_handler.py'), apiKey, apiSecret, baseUrl
    ]);

    let dataString = '';
    pythonProcess.stdout.on('data', (data) => { dataString += data.toString(); });
    pythonProcess.stderr.on('data', (data) => { console.error(`Python Script Error: ${data}`); });
    pythonProcess.on('close', (code) => {
      if (code !== 0) return reject(`Python script exited with code ${code}.`);
      try {
        const jsonData = JSON.parse(dataString);
        if (jsonData.error) return reject(jsonData.message);
        resolve(jsonData);
      } catch (error) {
        reject(`Failed to parse JSON. Raw output: ${dataString}`);
      }
    });
  });
}

// --- App and IPC Setup ---

app.whenReady().then(() => {
    const savedKeys = store.get('apiCredentials');
    if (savedKeys && savedKeys.key && savedKeys.secret) {
        createDashboardWindow();
    } else {
        createLoginWindow();
    }
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
    });
});

// THIS IS THE CORRECTED LISTENER
ipcMain.handle('get-positions', async (event, credentials) => {
    // The credentials object is passed directly as 'args'
    // We access its properties with credentials.key, credentials.secret, etc.
    return await getPositionsFromPython(credentials.key, credentials.secret, credentials.url);
});

ipcMain.on('save-api-keys', (event, keys) => {
    store.set('apiCredentials', keys);
});

ipcMain.handle('load-credentials', () => {
    return store.get('apiCredentials');
});

ipcMain.on('login-successful', () => {
    if (mainWindow) mainWindow.close();
    createDashboardWindow();
});

ipcMain.on('reset-app', () => {
    store.delete('apiCredentials');
    if (mainWindow) mainWindow.close();
    createLoginWindow();
});

ipcMain.on('save-theme', (event, theme) => {
    store.set('theme', theme);
});

ipcMain.handle('load-theme', () => {
    return store.get('theme', 'dark');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});