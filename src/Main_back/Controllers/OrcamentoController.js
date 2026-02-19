import Orcamentos from '../Models/Orcamentos.js';
import Usuarios from '../Models/Usuarios.js';
import Servicos from '../Models/Servicos.js';

class OrcamentoController {
    constructor() {
        this.OrcamentoModel = new Orcamentos();
        this.UsuarioModel = new Usuarios();
        this.ServicoModel = new Servicos();
    }

    async listar(params = {}) {
        try {
            return this.OrcamentoModel.listar(params);
        } catch (err) {
            console.error('[OrcamentoController] Erro ao listar:', err);
            return { data: [], total: 0, page: 1, totalPages: 0 };
        }
    }

    async buscarPorId(id) {
        try {
            const orcamento = this.OrcamentoModel.buscarPorId(id);
            if (!orcamento) return { success: false, message: 'Orçamento não encontrado.' };
            return { success: true, data: orcamento };
        } catch (err) {
            console.error('[OrcamentoController] Erro ao buscar:', err);
            return { success: false, message: 'Erro ao buscar orçamento.' };
        }
    }

    async cadastrar(orcamento) {
        if (!orcamento.titulo || !orcamento.cliente_uuid) {
            return { success: false, message: 'Título e cliente são obrigatórios.' };
        }
        try {
            const id = this.OrcamentoModel.adicionar(orcamento);
            return { success: true, message: 'Orçamento criado com sucesso!', id };
        } catch (err) {
            console.error('[OrcamentoController] Erro ao cadastrar:', err);
            return { success: false, message: 'Erro ao criar orçamento.' };
        }
    }

    async editar(orcamento) {
        if (!orcamento.id || !orcamento.titulo || !orcamento.cliente_uuid) {
            return { success: false, message: 'Dados inválidos para edição.' };
        }
        try {
            this.OrcamentoModel.atualizar(orcamento);
            return { success: true, message: 'Orçamento atualizado com sucesso!' };
        } catch (err) {
            console.error('[OrcamentoController] Erro ao editar:', err);
            return { success: false, message: 'Erro ao editar orçamento.' };
        }
    }

    async excluir(id) {
        if (!id) return { success: false, message: 'ID não informado.' };
        try {
            const ok = this.OrcamentoModel.remover(id);
            if (ok) return { success: true, message: 'Orçamento excluído com sucesso!' };
            return { success: false, message: 'Orçamento não encontrado.' };
        } catch (err) {
            console.error('[OrcamentoController] Erro ao excluir:', err);
            return { success: false, message: 'Erro ao excluir orçamento.' };
        }
    }

    async listarClientes() {
        try {
            // Retorna todos os usuários ativos para o select de clientes
            const resultado = this.UsuarioModel.listar({ limit: 999 });
            return resultado.data || [];
        } catch (err) {
            console.error('[OrcamentoController] Erro ao listar clientes:', err);
            return [];
        }
    }

    async listarServicosTrabalho() {
        try {
            return this.ServicoModel.listarPorTipo('trabalho');
        } catch (err) {
            console.error('[OrcamentoController] Erro ao listar serviços trabalho:', err);
            return [];
        }
    }
}

export default OrcamentoController;
