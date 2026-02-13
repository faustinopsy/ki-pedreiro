import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld(
    'darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle')
}
)

contextBridge.exposeInMainWorld(
    // window.api.listar()
    'api', {
    versions: process.versions,
    // Usuários
    listar: (params) => ipcRenderer.invoke("usuarios:listar", params),
    cadastrar: (usuario) => ipcRenderer.invoke("usuarios:cadastrar", usuario),
    buscarporid: (uuid) => ipcRenderer.invoke("usuarios:buscarporid", uuid),
    editarUsuario: (usuario) => ipcRenderer.invoke("usuarios:editarUsuario", usuario),
    removerUsuario: (uuid) => ipcRenderer.invoke("usuarios:removerusuario", uuid),
    obterDadosDashboard: () => ipcRenderer.invoke("usuarios:dashboardStats"),

    // Serviços
    listarServicos: (params) => ipcRenderer.invoke("servicos:listar", params),
    sincronizarServicos: () => ipcRenderer.invoke("servicos:sincronizar"),
    cadastrarServico: (servico) => ipcRenderer.invoke("servicos:cadastrar", servico),

}
)