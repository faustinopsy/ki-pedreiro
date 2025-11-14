import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld(
    //chave      objeto como valor
    // window.darkMode.toggle()
    'darkMode', {
        toggle: () => ipcRenderer.invoke('dark-mode:toggle')
    }
)