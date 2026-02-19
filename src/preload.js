import { contextBridge, ipcRenderer } from 'electron/renderer';

contextBridge.exposeInMainWorld('darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle')
});

contextBridge.exposeInMainWorld('api', {
    versions: process.versions,

    // Usuários
    listar: (params) => ipcRenderer.invoke("usuarios:listar", params),
    cadastrar: (usuario) => ipcRenderer.invoke("usuarios:cadastrar", usuario),
    buscarporid: (uuid) => ipcRenderer.invoke("usuarios:buscarPorId", uuid),
    editarUsuario: (usuario) => ipcRenderer.invoke("usuarios:editar", usuario),
    removerUsuario: (uuid) => ipcRenderer.invoke("usuarios:removerusuario", uuid),
    sincronizarUsuarios: () => ipcRenderer.invoke("usuarios:sincronizar"),
    obterDadosDashboard: () => ipcRenderer.invoke("usuarios:dashboardStats"),

    // Serviços
    listarServicos: (params) => ipcRenderer.invoke("servicos:listar", params),
    sincronizarServicos: () => ipcRenderer.invoke("servicos:sincronizar"),
    cadastrarServico: (servico) => ipcRenderer.invoke("servicos:cadastrar", servico),
    editarServico: (servico) => ipcRenderer.invoke("servicos:editar", servico),
    excluirServico: (id) => ipcRenderer.invoke("servicos:excluir", id),
    listarServicosTrabalho: () => ipcRenderer.invoke("servicos:listarTrabalho"),

    // Orçamentos
    listarOrcamentos: (params) => ipcRenderer.invoke("orcamentos:listar", params),
    cadastrarOrcamento: (o) => ipcRenderer.invoke("orcamentos:cadastrar", o),
    editarOrcamento: (o) => ipcRenderer.invoke("orcamentos:editar", o),
    excluirOrcamento: (id) => ipcRenderer.invoke("orcamentos:excluir", id),
    buscarOrcamento: (id) => ipcRenderer.invoke("orcamentos:buscar", id),
    listarClientesOrcamento: () => ipcRenderer.invoke("orcamentos:listarClientes"),
});