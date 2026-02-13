import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld(
    'darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle')
}
)

contextBridge.exposeInMainWorld(
    // window.api.listar()
    'api', {
    listar: () => ipcRenderer.invoke('usuarios:listar'),
    cadastrar: (usuario) => ipcRenderer.invoke('usuarios:cadastrar', usuario),
    buscarporid: (uuid) => ipcRenderer.invoke("usuarios:buscarPorId", uuid),
    editarUsuario: (usuario) => ipcRenderer.invoke("usuarios:editar", usuario),
    removerUsuario: (uuid) => ipcRenderer.invoke("usuarios:removerusuario", uuid),
    obterDadosDashboard: () => ipcRenderer.invoke("usuarios:dashboardStats"),

    // Serviços
    listarServicos: () => ipcRenderer.invoke("servicos:listar"),
    sincronizarServicos: () => ipcRenderer.invoke("servicos:sincronizar"),
    cadastrarServico: (servico) => ipcRenderer.invoke("servicos:cadastrar", servico),

}
)