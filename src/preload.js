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
  adicionarUsuario: (dados) => ipcRenderer.invoke('usuarios:salvar', dados),
  buscarUsuarioPorId: (id) => ipcRenderer.invoke('usuarios:buscarPorId', id),
  atualizarUsuario: (usuario) => ipcRenderer.invoke('usuarios:atualizar', usuario),
  removerUsuario: (id) => ipcRenderer.invoke('usuarios:remover', id),

});