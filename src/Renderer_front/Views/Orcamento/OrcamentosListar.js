class OrcamentosListar {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
        this._servicos = [];   // cache serviços trabalho
        this._clientes = [];   // cache clientes
        this._editandoId = null;
    }

    async renderizarLista() {
        const resultado = await window.api.listarOrcamentos({
            page: this.currentPage, limit: this.itemsPerPage, search: this.searchTerm
        });
        const dados = resultado.data || [];
        const total = resultado.total || 0;
        const totalPages = resultado.totalPages || Math.ceil(total / this.itemsPerPage);

        const html = `
        <div class="container">
            <header class="dashboard-header">
                <h1>Orçamentos</h1>
                <div class="header-actions">
                    <button id="btn-novo-orcamento" class="dashboard-btn primary">
                        <span class="icon">+</span><span class="text">Novo Orçamento</span>
                    </button>
                </div>
            </header>

            <div class="list-controls" style="margin-bottom:20px;">
                <input type="text" id="search-orcamentos" placeholder="Buscar por título ou cliente..."
                    value="${this.searchTerm}"
                    style="max-width:320px;">
            </div>

            <div id="tabela-orcamentos-container" style="overflow-x:auto;">
                ${this.construirTabela(dados)}
            </div>

            <div id="paginacao-orcamentos" style="display:flex; justify-content:center; align-items:center; margin-top:20px; gap:10px;">
                ${this.construirPaginacao(this.currentPage, totalPages)}
            </div>
        </div>

        <!-- Modal Orçamento (criar / editar) -->
        <dialog id="modal-orcamento" class="modal-dialog" style="max-width:720px;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-orcamento-titulo">Novo Orçamento</h2>
                    <span class="close-modal" id="fechar-modal-orcamento">&#10005;</span>
                </div>
                <form id="form-orcamento">
                    <input type="hidden" id="orc-id">

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div class="form-group">
                            <label for="orc-titulo">Título:</label>
                            <input type="text" id="orc-titulo" required placeholder="Ex: Reforma cozinha">
                        </div>
                        <div class="form-group">
                            <label for="orc-status">Status:</label>
                            <select id="orc-status">
                                <option value="rascunho">📝 Rascunho</option>
                                <option value="enviado">📤 Enviado</option>
                                <option value="aprovado">✅ Aprovado</option>
                                <option value="recusado">❌ Recusado</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="orc-cliente">Cliente:</label>
                        <select id="orc-cliente" required>
                            <option value="">— selecione um cliente —</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="orc-obs">Observações:</label>
                        <textarea id="orc-obs" rows="2" placeholder="Detalhes adicionais..."></textarea>
                    </div>

                    <!-- Itens -->
                    <div style="margin-top:16px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <strong>Itens do Orçamento</strong>
                            <button type="button" id="btn-add-item" class="btn-primary" style="padding:6px 12px; font-size:0.8rem;">+ Adicionar Item</button>
                        </div>
                        <div id="itens-container">
                            <!-- itens injetados dinamicamente -->
                        </div>
                        <div style="text-align:right; margin-top:12px; font-size:1.1rem;">
                            Total: <strong id="orc-total" style="color:var(--color-primary);">R$ 0,00</strong>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Salvar Orçamento</button>
                        <button type="button" id="cancelar-orcamento" class="btn-secondary">Cancelar</button>
                    </div>
                </form>
            </div>
        </dialog>`;

        return { html, init: () => this.init() };
    }

    construirTabela(orcamentos) {
        if (!orcamentos?.length)
            return '<p style="text-align:center; padding:20px;">Nenhum orçamento encontrado.</p>';

        const statusBadge = {
            rascunho: '<span class="badge badge-muted">📝 Rascunho</span>',
            enviado: '<span class="badge badge-vitrine">📤 Enviado</span>',
            aprovado: '<span class="badge badge-aprovado">✅ Aprovado</span>',
            recusado: '<span class="badge badge-recusado">❌ Recusado</span>',
        };

        return `
        <table class="user-table">
            <thead><tr>
                <th>#</th><th>Título</th><th>Cliente</th><th>Status</th><th>Valor Total</th><th>Data</th><th>Ações</th>
            </tr></thead>
            <tbody>
                ${orcamentos.map(o => `<tr>
                    <td style="color:var(--color-text-muted);">${o.id}</td>
                    <td><strong>${o.titulo}</strong></td>
                    <td>${o.cliente_nome || '—'}</td>
                    <td>${statusBadge[o.status] || o.status}</td>
                    <td style="font-weight:600;">R$ ${(o.valor_total || 0).toFixed(2)}</td>
                    <td style="color:var(--color-text-muted); font-size:0.8rem;">${o.criado_em?.substring(0, 10) || ''}</td>
                    <td>
                        <button class="editar-orcamento action-btn edit" data-id="${o.id}">Editar</button>
                        <button class="excluir-orcamento action-btn delete" data-id="${o.id}">Excluir</button>
                    </td>
                </tr>`).join('')}
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
        const resultado = await window.api.listarOrcamentos({
            page: this.currentPage, limit: this.itemsPerPage, search: this.searchTerm
        });
        const container = document.getElementById('tabela-orcamentos-container');
        const pag = document.getElementById('paginacao-orcamentos');
        if (container) container.innerHTML = this.construirTabela(resultado.data || []);
        if (pag) pag.innerHTML = this.construirPaginacao(this.currentPage, resultado.totalPages || 0);
    }

    // ── Itens dinâmicos ──────────────────────────────────────────
    _criarLinhaItem(servicos, item = null) {
        const div = document.createElement('div');
        div.className = 'item-linha';
        div.style.cssText = 'display:grid; grid-template-columns:1fr 80px 100px 90px 28px; gap:6px; align-items:center; margin-bottom:8px;';
        div.innerHTML = `
            <select class="item-servico">
                <option value="">— serviço —</option>
                ${servicos.map(s => `<option value="${s.id}" ${item?.servico_id == s.id ? 'selected' : ''}>${s.nome_servico}</option>`).join('')}
            </select>
            <input type="number" class="item-qtd" min="1" value="${item?.quantidade || 1}" placeholder="Qtd">
            <input type="number" class="item-valor" min="0" step="0.01" value="${item?.valor_unitario || ''}" placeholder="R$ unit.">
            <span class="item-subtotal" style="text-align:right; font-weight:600; font-size:0.9rem; color:var(--color-primary);">
                R$ ${((item?.quantidade || 1) * (item?.valor_unitario || 0)).toFixed(2)}
            </span>
            <button type="button" class="remover-item" style="background:var(--red-500); color:white; border:none; border-radius:4px; padding:4px 6px; cursor:pointer; font-size:0.8rem;">✕</button>
        `;

        const qtdInput = div.querySelector('.item-qtd');
        const valorInput = div.querySelector('.item-valor');
        const subtotalEl = div.querySelector('.item-subtotal');

        const atualizar = () => {
            const qtd = parseFloat(qtdInput.value) || 0;
            const val = parseFloat(valorInput.value) || 0;
            subtotalEl.textContent = `R$ ${(qtd * val).toFixed(2)}`;
            this._recalcularTotal();
        };

        qtdInput.addEventListener('input', atualizar);
        valorInput.addEventListener('input', atualizar);
        div.querySelector('.remover-item').addEventListener('click', () => {
            div.remove();
            this._recalcularTotal();
        });

        return div;
    }

    _recalcularTotal() {
        let total = 0;
        document.querySelectorAll('.item-linha').forEach(linha => {
            const qtd = parseFloat(linha.querySelector('.item-qtd').value) || 0;
            const val = parseFloat(linha.querySelector('.item-valor').value) || 0;
            total += qtd * val;
        });
        const el = document.getElementById('orc-total');
        if (el) el.textContent = `R$ ${total.toFixed(2)}`;
    }

    _coletarItens() {
        const itens = [];
        document.querySelectorAll('.item-linha').forEach(linha => {
            const servico_id = parseInt(linha.querySelector('.item-servico').value);
            const quantidade = parseInt(linha.querySelector('.item-qtd').value) || 1;
            const valor_unitario = parseFloat(linha.querySelector('.item-valor').value) || 0;
            if (servico_id) itens.push({ servico_id, quantidade, valor_unitario });
        });
        return itens;
    }

    async _preencherSelects(clientes, servicos, clienteUuid = '', status = 'rascunho') {
        const selCliente = document.getElementById('orc-cliente');
        const selStatus = document.getElementById('orc-status');
        if (selCliente) {
            selCliente.innerHTML = `<option value="">— selecione um cliente —</option>` +
                clientes.map(c => `<option value="${c.uuid}" ${c.uuid === clienteUuid ? 'selected' : ''}>${c.nome_usuario} (${c.tipo_usuario})</option>`).join('');
        }
        if (selStatus) selStatus.value = status;
    }

    init() {
        const modal = document.getElementById('modal-orcamento');
        const itensContainer = document.getElementById('itens-container');

        // Busca
        document.getElementById('search-orcamentos')?.addEventListener('input', (e) => {
            clearTimeout(this._searchTimeout);
            this._searchTimeout = setTimeout(() => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.atualizarLista();
            }, 500);
        });

        // Paginação
        document.getElementById('paginacao-orcamentos')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-paginacao') && !e.target.disabled) {
                const np = parseInt(e.target.getAttribute('data-page'));
                if (np > 0) { this.currentPage = np; this.atualizarLista(); }
            }
        });

        // Adicionar item
        document.getElementById('btn-add-item')?.addEventListener('click', () => {
            if (itensContainer) itensContainer.appendChild(this._criarLinhaItem(this._servicos));
        });

        // Abrir modal Novo
        document.getElementById('btn-novo-orcamento')?.addEventListener('click', async () => {
            this._editandoId = null;
            document.getElementById('modal-orcamento-titulo').textContent = 'Novo Orçamento';
            document.getElementById('form-orcamento').reset();
            document.getElementById('orc-id').value = '';
            if (itensContainer) itensContainer.innerHTML = '';
            document.getElementById('orc-total').textContent = 'R$ 0,00';

            window.utils.toggleSpinner(true);
            [this._clientes, this._servicos] = await Promise.all([
                window.api.listarClientesOrcamento(),
                window.api.listarServicosTrabalho()
            ]);
            window.utils.toggleSpinner(false);

            await this._preencherSelects(this._clientes, this._servicos);
            modal.showModal();
        });

        // Fechar modal
        ['fechar-modal-orcamento', 'cancelar-orcamento'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => {
                document.getElementById('form-orcamento').reset();
                if (itensContainer) itensContainer.innerHTML = '';
                modal.close();
            });
        });

        // Ações tabela
        document.getElementById('tabela-orcamentos-container')?.addEventListener('click', async (e) => {
            const t = e.target;

            // Excluir
            if (t.classList.contains('excluir-orcamento')) {
                const id = parseInt(t.getAttribute('data-id'));
                if (confirm('Excluir este orçamento?')) {
                    window.utils.toggleSpinner(true);
                    const res = await window.api.excluirOrcamento(id);
                    window.utils.toggleSpinner(false);
                    alert(res.success ? res.message : 'Erro: ' + res.message);
                    if (res.success) this.atualizarLista();
                }
            }

            // Editar
            if (t.classList.contains('editar-orcamento')) {
                const id = parseInt(t.getAttribute('data-id'));
                window.utils.toggleSpinner(true);
                const [res, clientes, servicos] = await Promise.all([
                    window.api.buscarOrcamento(id),
                    window.api.listarClientesOrcamento(),
                    window.api.listarServicosTrabalho()
                ]);
                window.utils.toggleSpinner(false);

                if (!res.success) { alert('Erro ao carregar orçamento.'); return; }

                this._clientes = clientes;
                this._servicos = servicos;
                this._editandoId = id;

                const o = res.data;
                document.getElementById('modal-orcamento-titulo').textContent = 'Editar Orçamento';
                document.getElementById('orc-id').value = o.id;
                document.getElementById('orc-titulo').value = o.titulo;
                document.getElementById('orc-obs').value = o.observacoes || '';
                if (itensContainer) itensContainer.innerHTML = '';

                await this._preencherSelects(clientes, servicos, o.cliente_uuid, o.status);

                for (const item of (o.itens || [])) {
                    itensContainer.appendChild(this._criarLinhaItem(servicos, item));
                }
                this._recalcularTotal();

                modal.showModal();
            }
        });

        // Submit
        document.getElementById('form-orcamento')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const itens = this._coletarItens();
            if (itens.length === 0) { alert('Adicione pelo menos um item ao orçamento.'); return; }

            const orcamento = {
                id: parseInt(document.getElementById('orc-id').value) || null,
                titulo: document.getElementById('orc-titulo').value,
                cliente_uuid: document.getElementById('orc-cliente').value,
                status: document.getElementById('orc-status').value,
                observacoes: document.getElementById('orc-obs').value,
                itens
            };

            window.utils.toggleSpinner(true);
            const res = orcamento.id
                ? await window.api.editarOrcamento(orcamento)
                : await window.api.cadastrarOrcamento(orcamento);
            window.utils.toggleSpinner(false);

            alert(res.success ? res.message : 'Erro: ' + res.message);
            if (res.success) {
                document.getElementById('form-orcamento').reset();
                if (itensContainer) itensContainer.innerHTML = '';
                modal.close();
                this.atualizarLista();
            }
        });
    }
}

export default OrcamentosListar;
