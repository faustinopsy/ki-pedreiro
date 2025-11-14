import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(
    //a chave  O objeto
    'darkMode', {           
        toggle: () => ipcRenderer.invoke('dark-mode:toggle')
    }
);
contextBridge.exposeInMainWorld(
   //a chave  O objeto
    'api', {      
        getAppVersion: () => ipcRenderer.invoke('get-version'),
    }
);

