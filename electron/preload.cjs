const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onDeepLink: (callback) => ipcRenderer.on('deep-link', (event, url) => callback(url)),
  getDeepLink: () => ipcRenderer.invoke('get-deep-link'),
  openExternal: (url) => ipcRenderer.send('open-external', url)
});
