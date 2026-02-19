class UsuariosView {
    constructor() {
    }
    renderizarMenu(stats = { total: 0, active: 0, inactive: 0 }) {
        return `<div class="container dashboard-container">
                    <header class="dashboard-header">
                        <h1>Dashboard</h1>
                        <p class="subtitle">Visão geral do sistema</p>
                    </header>
                    
                    <div class="stats-grid">
                        <div class="stat-card total">
                            <h3>Total</h3>
                            <p class="stat-number">${stats.total}</p>
                        </div>
                        <div class="stat-card active">
                            <h3>Ativos</h3>
                            <p class="stat-number">${stats.active}</p>
                        </div>
                        <div class="stat-card inactive">
                            <h3>Inativos</h3>
                            <p class="stat-number">${stats.inactive}</p>
                        </div>
                    </div>

                    <div class="actions-grid">
                        <a href="#usuario_listar" class="dashboard-btn secondary">
                            <span class="icon">≡</span>
                            <span class="text">Listar Usuários</span>
                        </a>
                        <a href="#servico_listar" class="dashboard-btn accent" style="background-color: #e67e22; color: white; border-color:#e67e22;">
                            <span class="icon">⚒</span>
                            <span class="text">Serviços</span>
                        </a>
                        <a href="#orcamento_listar" class="dashboard-btn accent" style="background-color: #27ae60; color: white; border-color:#27ae60;">
                            <span class="icon">📋</span>
                            <span class="text">Orçamentos</span>
                        </a>
                    </div>
                </div>`;
    }



    renderizarLista(Usuarios) {
        let container = `<div style="overflow-x:auto;" id="container">
                            <table class="user-table">
                            <thead>
                                <tr>
                                    <th>Nome</th><th>E-mail</th><th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>`;
        Usuarios.forEach(usuario => {
            container += `<tr>
                <td>${usuario.nome_usuario}</td>
                <td>${usuario.email_usuario}</td>
                <td> 
                    <button class="editar-user action-btn edit" data-id="${usuario.uuid}">Editar</button>
                    <button class="excluir-user action-btn delete" data-id="${usuario.uuid}">Excluir</button>
                </td>
            </tr>`
        });
        container += `</tbody></table></div>
        <dialog id="myModal" class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Editar Usuário</h2>
                    <span class="close-modal" id="fechar">&times;</span>
                </div>
                <form id="form-usuario">
                    <input type="text" id="id" hidden/>
                    <div class="form-group">
                        <label for="nome_usuario">Nome:</label>
                        <input type="text" id="nome_usuario" required/>
                    </div>
                    <div class="form-group">
                        <label for="email_usuario">E-mail:</label>
                        <input type="email" id="email_usuario" required/>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Salvar</button>
                        <button type="button" class="btn-secondary close-modal-btn">Cancelar</button>
                    </div>
                </form>
            </div>
        </dialog>`;
        return container;
    }
    renderizarFomulario() {
        return `<form id="form-usuario" class="create-user-form">
                    <div class="form-group">
                        <label for="nome_usuario">Nome:</label>
                        <input type="text" id="nome_usuario" required/>
                    </div>
                    <div class="form-group">
                        <label for="email_usuario">E-mail:</label>
                        <input type="email" id="email_usuario" required/>
                    </div>
                    <div class="form-group">
                        <label for="tipo_usuario">Tipo de usuário:</label>
                        <select id="tipo_usuario" class="form-control">
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary">Salvar</button>
                </form>`

    }

    abrirModal() {
        const modal = document.getElementById("myModal")
        if (modal) modal.showModal();
    }

    fecharModal() {
        const modal = document.getElementById("myModal")
        if (modal) modal.close();
    }
}
export default UsuariosView;