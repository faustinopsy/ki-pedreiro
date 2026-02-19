import MensagemDeAlerta from "../../../Services/MensagemDeAlerta.js"

class UsuarioListar {
    constructor() {
        this.mensagem = new MensagemDeAlerta();
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
    }

    async renderizarLista() {
        const resultado = await window.api.listar({
            page: this.currentPage,
            limit: this.itemsPerPage,
            search: this.searchTerm
        });

        const dados = resultado.data || resultado;
        const total = resultado.total || dados.length;
        const totalPages = resultado.totalPages || Math.ceil(total / this.itemsPerPage);

        const html = `
            <div class="container">
                <header class="dashboard-header">
                    <h1>Usuários</h1>
                    <div class="header-actions">
                        <button id="btn-novo-usuario" class="dashboard-btn primary">
                            <span class="icon">+</span>
                            <span class="text">Novo Usuário</span>
                        </button>
                        <button id="btn-sync-usuarios" class="dashboard-btn secondary">
                            <span class="icon">↻</span>
                            <span class="text">Sincronizar</span>
                        </button>
                    </div>
                </header>

                <div class="list-controls" style="margin-bottom: 20px;">
                    <input type="text" id="search-usuarios" placeholder="Buscar usuário..." value="${this.searchTerm}"
                        style="padding: 8px; border-radius: 4px; border: 1px solid #ccc; width: 100%; max-width: 300px;">
                </div>

                <div style="overflow-x:auto;" id="tabela-usuarios-container">
                    ${this.construirTabela(dados)}
                </div>

                <div id="paginacao-usuarios" style="display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 10px;">
                    ${this.construirPaginacao(this.currentPage, totalPages)}
                </div>
            </div>

            <!-- Modal Criar Usuário -->
            <dialog id="modal-criar-usuario" class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Novo Usuário</h2>
                        <span class="close-modal" id="fechar-modal-criar">&#10005;</span>
                    </div>
                    <form id="form-criar-usuario">
                        <div class="form-group">
                            <label for="criar-nome_usuario">Nome:</label>
                            <input type="text" id="criar-nome_usuario" required>
                        </div>
                        <div class="form-group">
                            <label for="criar-email_usuario">E-mail:</label>
                            <input type="email" id="criar-email_usuario" required>
                        </div>
                        <div class="form-group">
                            <label for="criar-tipo_usuario">Tipo:</label>
                            <select id="criar-tipo_usuario" class="form-control">
                                <option value="user">Usuário</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Salvar</button>
                            <button type="button" id="cancelar-criar-usuario" class="btn-secondary">Cancelar</button>
                        </div>
                    </form>
                </div>
            </dialog>

            <!-- Modal Editar Usuário -->
            <dialog id="modal-editar-usuario" class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Editar Usuário</h2>
                        <span class="close-modal" id="fechar-modal-editar">&#10005;</span>
                    </div>
                    <form id="form-editar-usuario">
                        <input type="hidden" id="editar-uuid">
                        <div class="form-group">
                            <label for="editar-nome_usuario">Nome:</label>
                            <input type="text" id="editar-nome_usuario" required>
                        </div>
                        <div class="form-group">
                            <label for="editar-email_usuario">E-mail:</label>
                            <input type="email" id="editar-email_usuario" required>
                        </div>
                        <div class="form-group">
                            <label for="editar-tipo_usuario">Tipo:</label>
                            <select id="editar-tipo_usuario" class="form-control">
                                <option value="user">Usuário</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Salvar</button>
                            <button type="button" id="cancelar-editar-usuario" class="btn-secondary">Cancelar</button>
                        </div>
                    </form>
                </div>
            </dialog>
        `;

        return { html: html, init: () => this.init() };
    }

    construirTabela(usuarios) {
        if (!usuarios || usuarios.length === 0) {
            return '<p style="text-align:center; padding: 20px;">Nenhum usuário encontrado.</p>';
        }

        let tabela = `
            <table class="user-table">
                <thead>
                    <tr>
                        <th>Nome</th><th>E-mail</th><th>Tipo</th><th>Sync</th><th>Ações</th>
                    </tr>
                </thead>
                <tbody>`;

        usuarios.forEach(usuario => {
            tabela += `<tr>
                <td>${usuario.nome_usuario}</td>
                <td>${usuario.email_usuario}</td>
                <td>${usuario.tipo_usuario || 'user'}</td>
                <td>${usuario.sync_status === 1 ? '<span style="color:green">● Sync</span>' : '<span style="color:orange">● Pendente</span>'}</td>
                <td>
                    <button class="editar-user action-btn edit" data-id="${usuario.uuid}">Editar</button>
                    <button class="excluir-user action-btn delete" data-id="${usuario.uuid}">Excluir</button>
                </td>
            </tr>`;
        });

        tabela += `</tbody></table>`;
        return tabela;
    }

    construirPaginacao(currentPage, totalPages) {
        if (totalPages <= 1) return '';
        let buttons = '';
        buttons += `<button class="btn-paginacao" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>&laquo; Anterior</button>`;
        buttons += `<span style="margin: 0 10px;">Página ${currentPage} de ${totalPages}</span>`;
        buttons += `<button class="btn-paginacao" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Próxima &raquo;</button>`;
        return buttons;
    }

    async atualizarLista() {
        window.utils.toggleSpinner(true);
        try {
            const resultado = await window.api.listar({
                page: this.currentPage,
                limit: this.itemsPerPage,
                search: this.searchTerm
            });
            const dados = resultado.data || [];
            const total = resultado.total || 0;
            const totalPages = resultado.totalPages || Math.ceil(total / this.itemsPerPage);

            const tabelaEl = document.getElementById('tabela-usuarios-container');
            const pagEl = document.getElementById('paginacao-usuarios');
            if (tabelaEl) tabelaEl.innerHTML = this.construirTabela(dados);
            if (pagEl) pagEl.innerHTML = this.construirPaginacao(this.currentPage, totalPages);
        } catch (error) {
            console.error(error);
            this.mensagem.erro("Erro ao atualizar lista.");
        } finally {
            window.utils.toggleSpinner(false);
        }
    }

    init() {
        const modalCriar = document.getElementById('modal-criar-usuario');
        const modalEditar = document.getElementById('modal-editar-usuario');
        const btnNovo = document.getElementById('btn-novo-usuario');
        const searchInput = document.getElementById('search-usuarios');
        const paginationContainer = document.getElementById('paginacao-usuarios');
        const tabelaContainer = document.getElementById('tabela-usuarios-container');

        // ---------- Pesquisa ----------
        if (searchInput) {
            let timeout = null;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.searchTerm = e.target.value;
                    this.currentPage = 1;
                    this.atualizarLista();
                }, 500);
            });
        }

        // ---------- Paginação ----------
        if (paginationContainer) {
            paginationContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-paginacao') && !e.target.disabled) {
                    const newPage = parseInt(e.target.getAttribute('data-page'));
                    if (newPage > 0) {
                        this.currentPage = newPage;
                        this.atualizarLista();
                    }
                }
            });
        }

        // ---------- Abrir Modal Criar ----------
        if (btnNovo && modalCriar) {
            btnNovo.addEventListener('click', () => {
                document.getElementById('form-criar-usuario').reset();
                modalCriar.showModal();
            });
        }

        // ---------- Sync Usuários ----------
        const btnSync = document.getElementById('btn-sync-usuarios');
        if (btnSync) {
            btnSync.addEventListener('click', async () => {
                window.utils.toggleSpinner(true);
                try {
                    const resultado = await window.api.sincronizarUsuarios();
                    if (resultado.success) {
                        this.mensagem.sucesso(resultado.message);
                        this.atualizarLista();
                    } else {
                        this.mensagem.erro(resultado.message);
                    }
                } catch (error) {
                    console.error(error);
                    this.mensagem.erro('Erro ao sincronizar.');
                } finally {
                    window.utils.toggleSpinner(false);
                }
            });
        }

        // Fechar Modal Criar
        const fecharCriar = document.getElementById('fechar-modal-criar');
        const cancelarCriar = document.getElementById('cancelar-criar-usuario');
        [fecharCriar, cancelarCriar].forEach(el => {
            if (el) el.addEventListener('click', () => {
                document.getElementById('form-criar-usuario').reset();
                modalCriar.close();
            });
        });

        // ---------- Fechar Modal Editar ----------
        const fecharEditar = document.getElementById('fechar-modal-editar');
        const cancelarEditar = document.getElementById('cancelar-editar-usuario');
        [fecharEditar, cancelarEditar].forEach(el => {
            if (el) el.addEventListener('click', () => {
                document.getElementById('form-editar-usuario').reset();
                modalEditar.close();
            });
        });

        // ---------- Ações da Tabela (delegação) ----------
        if (tabelaContainer) {
            tabelaContainer.addEventListener('click', async (e) => {
                const target = e.target;
                const uuid = target.getAttribute('data-id');

                // Excluir
                if (target.classList.contains('excluir-user')) {
                    if (confirm('Tem certeza que deseja excluir este usuário?')) {
                        const resultado = await window.api.removerUsuario(uuid);
                        if (resultado.success) {
                            this.mensagem.sucesso(resultado.message);
                            this.atualizarLista();
                        } else {
                            this.mensagem.erro(resultado.message || 'Erro ao excluir!');
                        }
                    }
                }

                // Editar — abrir modal preenchido
                if (target.classList.contains('editar-user')) {
                    const usuario = await window.api.buscarporid(uuid);
                    if (usuario && modalEditar) {
                        document.getElementById('editar-uuid').value = usuario.uuid;
                        document.getElementById('editar-nome_usuario').value = usuario.nome_usuario;
                        document.getElementById('editar-email_usuario').value = usuario.email_usuario;
                        const tipoSelect = document.getElementById('editar-tipo_usuario');
                        if (tipoSelect) tipoSelect.value = usuario.tipo_usuario || 'user';
                        modalEditar.showModal();
                    }
                }
            });
        }

        // ---------- Submit Criar ----------
        const formCriar = document.getElementById('form-criar-usuario');
        if (formCriar) {
            formCriar.addEventListener('submit', async (e) => {
                e.preventDefault();
                const usuario = {
                    nome_usuario: document.getElementById('criar-nome_usuario').value,
                    email_usuario: document.getElementById('criar-email_usuario').value,
                    tipo_usuario: document.getElementById('criar-tipo_usuario').value
                };
                window.utils.toggleSpinner(true);
                const resultado = await window.api.cadastrar(usuario);
                window.utils.toggleSpinner(false);
                if (resultado.success) {
                    this.mensagem.sucesso(resultado.message);
                    formCriar.reset();
                    modalCriar.close();
                    this.atualizarLista();
                } else {
                    this.mensagem.erro(resultado.message || 'Erro ao cadastrar!');
                }
            });
        }

        // ---------- Submit Editar ----------
        const formEditar = document.getElementById('form-editar-usuario');
        if (formEditar) {
            formEditar.addEventListener('submit', async (e) => {
                e.preventDefault();
                const usuario = {
                    uuid: document.getElementById('editar-uuid').value,
                    nome_usuario: document.getElementById('editar-nome_usuario').value,
                    email_usuario: document.getElementById('editar-email_usuario').value,
                    tipo_usuario: document.getElementById('editar-tipo_usuario').value
                };
                window.utils.toggleSpinner(true);
                const resultado = await window.api.editarUsuario(usuario);
                window.utils.toggleSpinner(false);
                if (resultado.success) {
                    this.mensagem.sucesso(resultado.message);
                    formEditar.reset();
                    modalEditar.close();
                    this.atualizarLista();
                } else {
                    this.mensagem.erro(resultado.message || 'Erro ao atualizar!');
                }
            });
        }
    }
}

export default UsuarioListar;