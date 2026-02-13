import UsuariosView from "../UsuariosView.js"
import MensagemDeAlerta from "../../../Services/MensagemDeAlerta.js"

class UsuarioListar {
    constructor() {
        this.view = new UsuariosView();
        this.mensagem = new MensagemDeAlerta();
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
    }

    async renderizarLista() {
        // Initial fetch
        const resultado = await window.api.listar({
            page: this.currentPage,
            limit: this.itemsPerPage,
            search: this.searchTerm
        });

        // Destructure response. If API returns just array (old format fallback), handle it.
        const dados = resultado.data || resultado;
        const total = resultado.total || dados.length;
        const totalPages = resultado.totalPages || Math.ceil(total / this.itemsPerPage);

        // Build UI Structure
        const html = `
            <div class="container">
                <div class="list-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>Lista de Usuários</h2>
                    <div class="search-box">
                        <input type="text" id="search-usuarios" placeholder="Buscar usuário..." value="${this.searchTerm}" style="padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                    </div>
                </div>

                <div id="tabela-usuarios-container">
                    ${this.construirTabela(dados)}
                </div>

                <div id="paginacao-usuarios" style="display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 10px;">
                    ${this.construirPaginacao(this.currentPage, totalPages)}
                </div>
            </div>
            
            <!-- Modal (Reusing existing modal logic from view, ensuring it is present) -->
            ${this.view.renderizarModal ? this.view.renderizarModal() : ''} 
            <!-- Fallback if View doesn't have partial method, we might need to rely on what's already there or inject it. 
                 The View's renderizarLista previously returned the table AND the modal. 
                 Let's extract the modal HTML to ensure it's available. -->
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
            </dialog>
        `;

        return {
            html: html,
            init: () => this.init()
        };
    }

    construirTabela(usuarios) {
        if (!usuarios || usuarios.length === 0) {
            return '<p style="text-align:center">Nenhum usuário encontrado.</p>';
        }

        let tabela = `
            <table class="user-table">
                <thead>
                    <tr>
                        <th>Nome</th><th>E-mail</th><th>Ações</th>
                    </tr>
                </thead>
                <tbody>`;

        usuarios.forEach(usuario => {
            tabela += `<tr>
                <td>${usuario.nome_usuario}</td>
                <td>${usuario.email_usuario}</td>
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

        // Prev
        buttons += `<button class="btn-paginacao" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>&laquo; Anterior</button>`;

        // Page info
        buttons += `<span style="margin: 0 10px;">Página ${currentPage} de ${totalPages}</span>`;

        // Next
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

            document.getElementById('tabela-usuarios-container').innerHTML = this.construirTabela(dados);
            document.getElementById('paginacao-usuarios').innerHTML = this.construirPaginacao(this.currentPage, totalPages);

        } catch (error) {
            console.error(error);
            this.mensagem.erro("Erro ao atualizar lista.");
        } finally {
            window.utils.toggleSpinner(false);
        }
    }

    init() {
        this.app = document.getElementById("container"); // The main container usually

        // Search Input Listener
        const searchInput = document.getElementById('search-usuarios');
        if (searchInput) {
            let timeout = null;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.searchTerm = e.target.value;
                    this.currentPage = 1; // Reset to page 1 on search
                    this.atualizarLista();
                }, 500); // 500ms debounce
            });
        }

        // Pagination Listener (Delegate from a parent container or attach directly if static)
        // Since pagination controls are rebuilt, delegation on 'paginacao-usuarios' or document is better.
        const paginationContainer = document.getElementById('paginacao-usuarios');
        if (paginationContainer) {
            paginationContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-paginacao') && !e.target.disabled) {
                    const newPage = parseInt(e.target.getAttribute('data-page'));
                    if (newPage > 0) { // Check upper limit too if stored
                        this.currentPage = newPage;
                        this.atualizarLista();
                    }
                }
            });
        }

        // Table Actions (Delegate)
        // Note: Using document.querySelector('.container') or similar wrapper 
        // because "container" id inside the renderizarLista HTML might conflict if proper scoping isn't used.
        // But assuming 'tabela-usuarios-container' is a good delegation point.
        const tableContainer = document.getElementById('tabela-usuarios-container');
        if (tableContainer) {
            tableContainer.addEventListener("click", async (e) => {
                const target = e.target;
                const idUsuario = target.getAttribute("data-id");

                if (target.classList.contains("editar-user")) {
                    const usuario = await window.api.buscarporid(idUsuario);

                    const id = document.getElementById("id");
                    const nome_usuario = document.getElementById("nome_usuario");
                    const email_usuario = document.getElementById("email_usuario");

                    if (usuario && id && nome_usuario && email_usuario) {
                        id.value = usuario.uuid;
                        nome_usuario.value = usuario.nome_usuario;
                        email_usuario.value = usuario.email_usuario;
                        this.view.abrirModal();
                    }
                }
                if (target.classList.contains("excluir-user")) {
                    if (confirm("Tem certeza que deseja excluir este usuário?")) {
                        const resultado = await window.api.removerUsuario(idUsuario);
                        if (resultado.success) {
                            this.mensagem.sucesso(resultado.message);
                            this.atualizarLista(); // Reload dynamic list instead of full page
                        } else {
                            this.mensagem.erro(resultado.message || "Erro ao tentar excluir!");
                        }
                    }
                }
            });
        }

        // Modal Events
        const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => this.view.fecharModal());
        });

        const formulario = document.getElementById('form-usuario');
        if (formulario) {
            formulario.addEventListener('submit', async (event) => {
                event.preventDefault();
                const id = document.getElementById('id');
                const nome_usuario = document.getElementById('nome_usuario');
                const email_usuario = document.getElementById('email_usuario');

                const usuario = {
                    uuid: id.value,
                    nome_usuario: nome_usuario.value,
                    email_usuario: email_usuario.value
                };

                const resultado = await window.api.editarUsuario(usuario);
                if (resultado.success) {
                    nome_usuario.value = '';
                    email_usuario.value = '';
                    this.mensagem.sucesso(resultado.message);
                    this.view.fecharModal();
                    this.atualizarLista();
                } else {
                    this.mensagem.erro(resultado.message || "Erro ao atualizar!");
                }
            });
        }
    }
}
export default UsuarioListar;