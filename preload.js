// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // One-way message from UI to Main Process (e.g., save settings)
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  // Two-way message from UI to Main Process and back (e.g., get data)
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  // Message from Main Process to UI (e.g., send loaded settings on startup)
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
});