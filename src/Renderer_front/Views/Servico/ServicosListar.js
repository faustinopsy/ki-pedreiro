class ServicosListar {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
        this.filtroTipo = '';
    }

    async renderizarLista() {
        try {
            const resultado = await window.api.listarServicos({
                page: this.currentPage,
                limit: this.itemsPerPage,
                search: this.searchTerm,
                tipo_servico: this.filtroTipo
            });

            const dados = resultado.data || resultado;
            const total = resultado.total || dados.length;
            const totalPages = resultado.totalPages || Math.ceil(total / this.itemsPerPage);

            const html = `
            <div class="container">
                <header class="dashboard-header">
                    <h1>Serviços</h1>
                    <div class="header-actions">
                        <button id="btn-novo-servico" class="dashboard-btn primary">
                            <span class="icon">+</span><span class="text">Novo Serviço</span>
                        </button>
                        <button id="btn-sync-servicos" class="dashboard-btn secondary">
                            <span class="icon">↻</span><span class="text">Sincronizar</span>
                        </button>
                    </div>
                </header>

                <div class="list-controls" style="display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap;">
                    <input type="text" id="search-servicos" placeholder="Buscar serviço..."
                        value="${this.searchTerm}"
                        style="flex:1; min-width:200px; max-width:320px;">
                    <select id="filtro-tipo-servico" style="min-width:160px;">
                        <option value="">Todos os tipos</option>
                        <option value="vitrine" ${this.filtroTipo === 'vitrine' ? 'selected' : ''}>🌐 Vitrine (site)</option>
                        <option value="trabalho" ${this.filtroTipo === 'trabalho' ? 'selected' : ''}>🔧 Trabalho (orçamento)</option>
                    </select>
                </div>

                <div style="overflow-x:auto;" id="tabela-servicos-container">
                    ${this.construirTabela(dados)}
                </div>

                <div id="paginacao-servicos" style="display:flex; justify-content:center; align-items:center; margin-top:20px; gap:10px;">
                    ${this.construirPaginacao(this.currentPage, totalPages)}
                </div>
            </div>

            <!-- Modal Novo Serviço -->
            <dialog id="modal-servico" class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Novo Serviço</h2>
                        <span class="close-modal" id="fechar-modal-servico">&#10005;</span>
                    </div>
                    <form id="form-servico">
                        <div class="form-group">
                            <label for="nome_servico">Nome do Serviço:</label>
                            <input type="text" id="nome_servico" required>
                        </div>
                        <div class="form-group">
                            <label for="tipo_servico_criar">Tipo:</label>
                            <select id="tipo_servico_criar">
                                <option value="vitrine">🌐 Vitrine — exibido no site</option>
                                <option value="trabalho">🔧 Trabalho — usado em orçamentos</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="descricao_servico">Descrição:</label>
                            <textarea id="descricao_servico" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="foto_servico_file">Foto:</label>
                            <input type="file" id="foto_servico_file" accept="image/*">
                            <img id="img-preview-servico" src="" alt="Preview"
                                style="display:none; max-width:150px; max-height:120px; margin-top:8px; border-radius:6px; object-fit:cover; border:1px solid #ccc;">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Salvar</button>
                            <button type="button" id="cancelar-servico" class="btn-secondary">Cancelar</button>
                        </div>
                    </form>
                </div>
            </dialog>

            <!-- Modal Editar Serviço -->
            <dialog id="modal-editar-servico" class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Editar Serviço</h2>
                        <span class="close-modal" id="fechar-modal-editar-servico">&#10005;</span>
                    </div>
                    <form id="form-editar-servico">
                        <input type="hidden" id="editar-servico-id">
                        <div class="form-group">
                            <label for="editar-nome_servico">Nome:</label>
                            <input type="text" id="editar-nome_servico" required>
                        </div>
                        <div class="form-group">
                            <label for="editar-tipo_servico">Tipo:</label>
                            <select id="editar-tipo_servico">
                                <option value="vitrine">🌐 Vitrine — exibido no site</option>
                                <option value="trabalho">🔧 Trabalho — usado em orçamentos</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editar-descricao_servico">Descrição:</label>
                            <textarea id="editar-descricao_servico" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="editar-foto_servico_file">Nova Foto (opcional):</label>
                            <input type="file" id="editar-foto_servico_file" accept="image/*">
                            <img id="editar-img-preview" src="" alt="Preview"
                                style="display:none; max-width:150px; max-height:120px; margin-top:8px; border-radius:6px; object-fit:cover; border:1px solid #ccc;">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Salvar</button>
                            <button type="button" id="cancelar-editar-servico" class="btn-secondary">Cancelar</button>
                        </div>
                    </form>
                </div>
            </dialog>`;

            return { html, init: () => this.init() };
        } catch (err) {
            console.error(err);
            return { html: `<div class="error-state"><h2>Erro ao carregar serviços</h2><p>${err.message}</p></div>` };
        }
    }

    construirTabela(servicos) {
        if (!servicos || servicos.length === 0)
            return '<p style="text-align:center; padding:20px;">Nenhum serviço encontrado.</p>';

        return `
        <table class="user-table">
            <thead><tr>
                <th>Foto</th><th>Nome</th><th>Tipo</th><th>Descrição</th><th>Sync</th><th>Ações</th>
            </tr></thead>
            <tbody>
                ${servicos.map(s => {
            const img = s.image_base64?.startsWith('data:image')
                ? `<img src="${s.image_base64}" style="width:48px;height:48px;object-fit:cover;border-radius:4px;">`
                : '<span style="color:#aaa;font-size:1.5rem;">📷</span>';
            const tipoBadge = s.tipo_servico === 'trabalho'
                ? `<span class="badge badge-trabalho">🔧 Trabalho</span>`
                : `<span class="badge badge-vitrine">🌐 Vitrine</span>`;
            const sync = s.sync_status === 1
                ? '<span style="color:green">● Sync</span>'
                : '<span style="color:orange">● Pendente</span>';
            const desc = (s.descricao_servico || '').substring(0, 60) + ((s.descricao_servico || '').length > 60 ? '...' : '');
            return `<tr>
                        <td>${img}</td>
                        <td><strong>${s.nome_servico}</strong></td>
                        <td>${tipoBadge}</td>
                        <td style="color:var(--color-text-muted); font-size:0.875rem;">${desc}</td>
                        <td>${sync}</td>
                        <td>
                            <button class="editar-servico action-btn edit"
                                data-id="${s.id}"
                                data-nome="${(s.nome_servico || '').replace(/"/g, '&quot;')}"
                                data-descricao="${(s.descricao_servico || '').replace(/"/g, '&quot;')}"
                                data-tipo="${s.tipo_servico || 'vitrine'}"
                                data-img="${s.image_base64 || ''}">Editar</button>
                            <button class="excluir-servico action-btn delete" data-id="${s.id}">Excluir</button>
                        </td>
                    </tr>`;
        }).join('')}
            </tbody>
        </table>`;
    }

    construirPaginacao(currentPage, totalPages) {
        if (totalPages <= 1) return '';
        return `
            <button class="btn-paginacao" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>&laquo; Anterior</button>
            <span style="margin:0 10px;">Página ${currentPage} de ${totalPages}</span>
            <button class="btn-paginacao" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Próxima &raquo;</button>`;
    }

    async atualizarLista() {
        const resultado = await window.api.listarServicos({
            page: this.currentPage, limit: this.itemsPerPage,
            search: this.searchTerm, tipo_servico: this.filtroTipo
        });
        const dados = resultado.data || [];
        const totalPages = resultado.totalPages || 0;
        const container = document.getElementById('tabela-servicos-container');
        const pag = document.getElementById('paginacao-servicos');
        if (container) container.innerHTML = this.construirTabela(dados);
        if (pag) pag.innerHTML = this.construirPaginacao(this.currentPage, totalPages);
    }

    _lerBase64(file) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = e => resolve(e.target.result);
            r.onerror = reject;
            r.readAsDataURL(file);
        });
    }

    init() {
        const modal = document.getElementById('modal-servico');
        const modalEditar = document.getElementById('modal-editar-servico');
        const fotoInput = document.getElementById('foto_servico_file');
        const imgPreview = document.getElementById('img-preview-servico');
        const editarFotoInput = document.getElementById('editar-foto_servico_file');
        const editarImgPreview = document.getElementById('editar-img-preview');

        // Busca
        document.getElementById('search-servicos')?.addEventListener('input', (e) => {
            clearTimeout(this._searchTimeout);
            this._searchTimeout = setTimeout(() => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.atualizarLista();
            }, 500);
        });

        // Filtro tipo
        document.getElementById('filtro-tipo-servico')?.addEventListener('change', (e) => {
            this.filtroTipo = e.target.value;
            this.currentPage = 1;
            this.atualizarLista();
        });

        // Paginação
        document.getElementById('paginacao-servicos')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-paginacao') && !e.target.disabled) {
                const np = parseInt(e.target.getAttribute('data-page'));
                if (np > 0) { this.currentPage = np; this.atualizarLista(); }
            }
        });

        // Preview imagem criar
        fotoInput?.addEventListener('change', () => {
            const f = fotoInput.files[0];
            if (f) { const r = new FileReader(); r.onload = e => { imgPreview.src = e.target.result; imgPreview.style.display = 'block'; }; r.readAsDataURL(f); }
            else { imgPreview.src = ''; imgPreview.style.display = 'none'; }
        });

        // Preview imagem editar
        editarFotoInput?.addEventListener('change', () => {
            const f = editarFotoInput.files[0];
            if (f) { const r = new FileReader(); r.onload = e => { editarImgPreview.src = e.target.result; editarImgPreview.style.display = 'block'; }; r.readAsDataURL(f); }
            else { editarImgPreview.src = ''; editarImgPreview.style.display = 'none'; }
        });

        // Sync
        document.getElementById('btn-sync-servicos')?.addEventListener('click', async () => {
            window.utils.toggleSpinner(true);
            const res = await window.api.sincronizarServicos();
            window.utils.toggleSpinner(false);
            alert(res.success ? res.message : 'Erro: ' + res.message);
            if (res.success) this.atualizarLista();
        });

        // Abrir modal novo
        document.getElementById('btn-novo-servico')?.addEventListener('click', () => {
            document.getElementById('form-servico').reset();
            imgPreview.src = ''; imgPreview.style.display = 'none';
            modal.showModal();
        });

        // Fechar modal novo
        ['fechar-modal-servico', 'cancelar-servico'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => {
                document.getElementById('form-servico').reset();
                imgPreview.src = ''; imgPreview.style.display = 'none';
                modal.close();
            });
        });

        // Fechar modal editar
        ['fechar-modal-editar-servico', 'cancelar-editar-servico'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => {
                document.getElementById('form-editar-servico').reset();
                editarImgPreview.src = ''; editarImgPreview.style.display = 'none';
                modalEditar.close();
            });
        });

        // Delegação tabela
        document.getElementById('tabela-servicos-container')?.addEventListener('click', async (e) => {
            const t = e.target;
            // Excluir
            if (t.classList.contains('excluir-servico')) {
                const id = parseInt(t.getAttribute('data-id'));
                if (confirm('Excluir este serviço?')) {
                    window.utils.toggleSpinner(true);
                    const res = await window.api.excluirServico(id);
                    window.utils.toggleSpinner(false);
                    alert(res.success ? res.message : 'Erro: ' + res.message);
                    if (res.success) this.atualizarLista();
                }
            }
            // Editar
            if (t.classList.contains('editar-servico')) {
                document.getElementById('editar-servico-id').value = t.getAttribute('data-id');
                document.getElementById('editar-nome_servico').value = t.getAttribute('data-nome');
                document.getElementById('editar-descricao_servico').value = t.getAttribute('data-descricao');
                document.getElementById('editar-tipo_servico').value = t.getAttribute('data-tipo') || 'vitrine';
                const img = t.getAttribute('data-img');
                if (img?.startsWith('data:image')) { editarImgPreview.src = img; editarImgPreview.style.display = 'block'; }
                else { editarImgPreview.src = ''; editarImgPreview.style.display = 'none'; }
                modalEditar.showModal();
            }
        });

        // Submit criar
        document.getElementById('form-servico')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            let imageBase64 = null;
            const f = fotoInput?.files[0];
            if (f) imageBase64 = await this._lerBase64(f);
            const servico = {
                nome_servico: document.getElementById('nome_servico').value,
                descricao_servico: document.getElementById('descricao_servico').value,
                tipo_servico: document.getElementById('tipo_servico_criar').value,
                image_base64: imageBase64
            };
            window.utils.toggleSpinner(true);
            const res = await window.api.cadastrarServico(servico);
            window.utils.toggleSpinner(false);
            alert(res.success ? res.message : 'Erro: ' + res.message);
            if (res.success) { document.getElementById('form-servico').reset(); imgPreview.src = ''; imgPreview.style.display = 'none'; modal.close(); this.atualizarLista(); }
        });

        // Submit editar
        document.getElementById('form-editar-servico')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            let imageBase64 = null;
            const f = editarFotoInput?.files[0];
            if (f) imageBase64 = await this._lerBase64(f);
            const servico = {
                id: parseInt(document.getElementById('editar-servico-id').value),
                nome_servico: document.getElementById('editar-nome_servico').value,
                descricao_servico: document.getElementById('editar-descricao_servico').value,
                tipo_servico: document.getElementById('editar-tipo_servico').value,
                image_base64: imageBase64
            };
            window.utils.toggleSpinner(true);
            const res = await window.api.editarServico(servico);
            window.utils.toggleSpinner(false);
            alert(res.success ? res.message : 'Erro: ' + res.message);
            if (res.success) { document.getElementById('form-editar-servico').reset(); editarImgPreview.src = ''; editarImgPreview.style.display = 'none'; modalEditar.close(); this.atualizarLista(); }
        });
    }
}

export default ServicosListar;
