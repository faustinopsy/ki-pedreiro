class ServicosListar {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
    }

    async renderizarLista() {
        try {
            const resultado = await window.api.listarServicos({
                page: this.currentPage,
                limit: this.itemsPerPage,
                search: this.searchTerm
            });

            const dados = resultado.data || resultado;
            const total = resultado.total || dados.length;
            const totalPages = resultado.totalPages || Math.ceil(total / this.itemsPerPage);


            let html = `
            <div class="container">
                <header class="dashboard-header">
                    <h1>Serviços</h1>
                    <div class="header-actions">
                         <button id="btn-novo-servico" class="dashboard-btn primary">
                            <span class="icon">+</span>
                            <span class="text">Novo Serviço</span>
                        </button>
                         <button id="btn-sync-servicos" class="dashboard-btn secondary">
                            <span class="icon">↻</span>
                            <span class="text">Sincronizar</span>
                        </button>
                    </div>
                </header>

                <div class="list-controls" style="margin-bottom: 20px;">
                     <input type="text" id="search-servicos" placeholder="Buscar serviço..." value="${this.searchTerm}" style="padding: 8px; border-radius: 4px; border: 1px solid #ccc; width: 100%; max-width: 300px;">
                </div>

                <div style="overflow-x:auto;" id="tabela-servicos-container">
                    ${this.construirTabela(dados)}
                </div>

                <div id="paginacao-servicos" style="display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 10px;">
                    ${this.construirPaginacao(this.currentPage, totalPages)}
                </div>
            </div>

            <dialog id="modal-servico" class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Novo Serviço</h2>
                        <span class="close-modal" id="fechar-modal-servico">&times;</span>
                    </div>
                    <form id="form-servico">
                        <div class="form-group">
                            <label for="nome_servico">Nome do Serviço:</label>
                            <input type="text" id="nome_servico" name="nome_servico" required>
                        </div>
                        <div class="form-group">
                            <label for="descricao_servico">Descrição:</label>
                            <textarea id="descricao_servico" name="descricao_servico"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="foto_servico">Foto (URL/Caminho):</label>
                            <input type="text" id="foto_servico" name="foto_servico" placeholder="Ex: servicos/foto.jpg">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Salvar</button>
                            <button type="button" id="cancelar-servico" class="btn-secondary">Cancelar</button>
                        </div>
                    </form>
                </div>
            </dialog>
            `;

            return { html: html, init: () => this.init() };

        } catch (error) {
            console.error(error);
            return { html: `<div class="error-state"><h2>Erro ao carregar serviços</h2><p>${error.message}</p></div>` };
        }
    }

    construirTabela(servicos) {
        if (!servicos || servicos.length === 0) {
            return '<p style="text-align:center; padding: 20px;">Nenhum serviço encontrado.</p>';
        }

        let container = `
            <table class="user-table">
                <thead>
                    <tr>
                        <th>Foto</th>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Status Sync</th>
                    </tr>
                </thead>
                <tbody>`;

        servicos.forEach(servico => {
            const imgThumb = servico.image_base64 && servico.image_base64.startsWith('data:image')
                ? `<img src="${servico.image_base64}" alt="${servico.nome_servico}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">`
                : (servico.caminho_imagem ? `<img src="http://localhost:8000${servico.caminho_imagem}" alt="${servico.nome_servico}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onError="this.style.display='none'">` : '<span style="color:#ccc;">Sem foto</span>');

            container += `<tr>
                <td>${imgThumb}</td>
                <td>${servico.nome_servico}</td>
                <td>${servico.descricao_servico}</td>
                <td>${servico.sync_status === 1 ? '<span style="color:green">● Sincronizado</span>' : '<span style="color:orange">● Pendente</span>'}</td>
            </tr>`;
        });

        container += `</tbody>
                </table>`;
        return container;
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
        try {
            const resultado = await window.api.listarServicos({
                page: this.currentPage,
                limit: this.itemsPerPage,
                search: this.searchTerm
            });
            const dados = resultado.data || [];
            const total = resultado.total || 0;
            const totalPages = resultado.totalPages || Math.ceil(total / this.itemsPerPage);

            const container = document.getElementById('tabela-servicos-container');
            const paginacao = document.getElementById('paginacao-servicos');

            if (container) container.innerHTML = this.construirTabela(dados);
            if (paginacao) paginacao.innerHTML = this.construirPaginacao(this.currentPage, totalPages);

        } catch (error) {
            console.error(error);
        }
    }

    init() {
        const btnSync = document.getElementById('btn-sync-servicos');
        const btnNovo = document.getElementById('btn-novo-servico');
        const modal = document.getElementById('modal-servico');
        const btnFechar = document.getElementById('fechar-modal-servico');
        const btnCancelar = document.getElementById('cancelar-servico');
        const form = document.getElementById('form-servico');
        const searchInput = document.getElementById('search-servicos');
        const paginationContainer = document.getElementById('paginacao-servicos');

        // Search
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

        // Pagination
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

        if (btnSync) {
            btnSync.addEventListener('click', async () => {
                try {
                    window.utils.toggleSpinner(true);
                    const resultado = await window.api.sincronizarServicos();
                    window.utils.toggleSpinner(false);

                    if (resultado.success) {
                        alert(resultado.message);
                        this.atualizarLista(); // Just update list instead of reload
                    } else {
                        alert('Erro: ' + resultado.message);
                    }
                } catch (error) {
                    window.utils.toggleSpinner(false);
                    console.error(error);
                    alert('Erro inesperado ao sincronizar.');
                }
            });
        }

        if (btnNovo && modal) {
            btnNovo.addEventListener('click', () => {
                modal.showModal();
            });
        }

        if (btnFechar && modal) {
            btnFechar.addEventListener('click', () => modal.close());
        }

        if (btnCancelar && modal) {
            btnCancelar.addEventListener('click', () => modal.close());
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const servico = {
                    nome_servico: formData.get('nome_servico'),
                    descricao_servico: formData.get('descricao_servico'),
                    foto_servico: formData.get('foto_servico'),
                    caminho_imagem: formData.get('foto_servico')
                };

                try {
                    window.utils.toggleSpinner(true);
                    const res = await window.api.cadastrarServico(servico);
                    window.utils.toggleSpinner(false);

                    if (res.success) {
                        alert(res.message);
                        modal.close();
                        this.atualizarLista();
                    } else {
                        alert('Erro: ' + res.message);
                    }
                } catch (err) {
                    window.utils.toggleSpinner(false);
                    console.error(err);
                    alert('Erro ao cadastrar serviço.');
                }
            });
        }
    }
}

export default ServicosListar;
