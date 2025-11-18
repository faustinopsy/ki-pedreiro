import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld(
    //chave      objeto como valor
    // window.darkMode.toggle()
    'darkMode', {
        toggle: () => ipcRenderer.invoke('dark-mode:toggle')
    }
)
contextBridge.exposeInMainWorld('api', {
  listarUsuarios: () => ipcRenderer.invoke('usuarios:listar'),
  listarServicos: () => ipcRenderer.invoke('servicos:listar'),
 adicionarUsuario: (dados) => ipcRenderer.invoke('usuarios:salvar', dados)
});