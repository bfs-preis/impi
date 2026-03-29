const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, ...args) => ipcRenderer.send(channel, ...args),
        once: (channel, listener) => {
            ipcRenderer.once(channel, (_event, ...args) => listener(...args));
        },
        on: (channel, listener) => {
            ipcRenderer.on(channel, (_event, ...args) => listener(...args));
        }
    }
});
