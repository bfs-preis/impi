const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, ...args) => ipcRenderer.send(channel, ...args),
        once: (channel, listener) => {
            ipcRenderer.once(channel, (_event, ...args) => listener(...args));
        },
        on: (channel, listener) => {
            const wrapped = (_event, ...args) => listener(...args);
            ipcRenderer.on(channel, wrapped);
            // Store reference for removeListener
            listener._wrapped = wrapped;
        },
        removeListener: (channel, listener) => {
            ipcRenderer.removeListener(channel, listener._wrapped || listener);
        }
    }
});
