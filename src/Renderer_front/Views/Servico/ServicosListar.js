class ServicosListar {
    async renderizarLista() {
        try {
            const servicos = await window.api.listarServicos();

            let container = `
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
                
                <div style="overflow-x:auto;" id="container">
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

            if (servicos.length === 0) {
                container += `<tr><td colspan="4" style="text-align:center;">Nenhum serviço encontrado. Clique em "Sincronizar" para buscar da API ou "Novo Serviço" para cadastrar.</td></tr>`;
            } else {
                servicos.forEach(servico => {
                    // Tenta usar base64 se existir, senão caminho relativo, senão placeholder
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
            }

            container += `</tbody>
                    </table>
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

            // Adicionar evento após renderizar. 
            // Como retornamos string HTML, o renderer.js injeta no DOM.
            // Precisamos garantir que o listener seja anexado DEPOIS que o HTML estiver na página.
            // O renderer.js atual (pelo que vi) chama init() se existir. Vamos usar isso.

            this.html = container;
            return this;
        } catch (error) {
            console.error(error);
            return { html: `<div class="error-state"><h2>Erro ao carregar serviços</h2><p>${error.message}</p></div>` };
        }
    }

    init() {
        // Função chamada após inserção no DOM pelo renderer.js (se suportado, verifiquei no renderer.js e suporta resposta.init())
        const btnSync = document.getElementById('btn-sync-servicos');
        const btnNovo = document.getElementById('btn-novo-servico');
        const modal = document.getElementById('modal-servico');
        const btnFechar = document.getElementById('fechar-modal-servico');
        const btnCancelar = document.getElementById('cancelar-servico');
        const form = document.getElementById('form-servico');

        if (btnSync) {
            btnSync.addEventListener('click', async () => {
                try {
                    window.utils.toggleSpinner(true);
                    const resultado = await window.api.sincronizarServicos();
                    window.utils.toggleSpinner(false);

                    if (resultado.success) {
                        alert(resultado.message);
                        // Recarregar a página/rota para atualizar a tabela
                        window.location.reload();
                        // ou chamar renderizarLista novamente, mas reload é mais simples p/ SPA hash refresh
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
                    foto_servico: formData.get('foto_servico'), // Campo texto por enquanto, conforme pedido
                    caminho_imagem: formData.get('foto_servico') // Usando o mesmo para caminho por enquanto ou vazio
                };

                try {
                    window.utils.toggleSpinner(true);
                    const res = await window.api.cadastrarServico(servico);
                    window.utils.toggleSpinner(false);

                    if (res.success) {
                        alert(res.message);
                        modal.close();
                        window.location.reload();
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
