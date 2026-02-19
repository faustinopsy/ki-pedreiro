import Servicos from '../Models/Servicos.js';
import { net } from 'electron';

class ServicoController {
    constructor() {
        this.ServicoModel = new Servicos();
    }

    listar(params) {
        return this.ServicoModel.listar(params);
    }

    async sincronizar() {
        try {
            console.log('[ServicoController] Iniciando sincronização de serviços...');
            const response = await fetch('http://localhost:8000/backend/api/servicos');

            // Lê como texto primeiro para evitar crash quando a API retorna HTML de erro
            const rawText = await response.text();

            let resultado;
            try {
                resultado = JSON.parse(rawText);
            } catch (_) {
                console.warn('[ServicoController] API retornou resposta não-JSON:', rawText.substring(0, 200));
                return {
                    success: false,
                    message: `A API retornou uma resposta inválida (não-JSON). Verifique se o servidor PHP está rodando corretamente em localhost:8000.`
                };
            }

            if (!response.ok) {
                return { success: false, message: `Erro na API (${response.status}): ${resultado?.message || response.statusText}` };
            }

            if (resultado.status === 'success' && Array.isArray(resultado.data)) {
                this.ServicoModel.cadastrarLocalmente(resultado.data);
                return { success: true, message: `${resultado.data.length} serviço(s) sincronizado(s) com sucesso!` };
            } else {
                console.warn('[ServicoController] Formato de resposta inesperado:', resultado);
                return { success: false, message: 'Formato de resposta da API inválido.' };
            }
        } catch (error) {
            console.error('[ServicoController] Erro ao sincronizar serviços:', error);
            // Erro de rede (API offline)
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, message: 'Não foi possível conectar à API. Verifique se o servidor está online.' };
            }
            return { success: false, message: `Erro: ${error.message}` };
        }
    }

    async cadastrar(servico) {
        try {
            const id = this.ServicoModel.adicionar(servico);
            return { success: true, id: id, message: 'Serviço cadastrado com sucesso!' };
        } catch (error) {
            console.error('[ServicoController] Erro ao cadastrar:', error);
            return { success: false, message: 'Erro ao cadastrar serviço.' };
        }
    }

    async editar(servico) {
        if (!servico.id) {
            return { success: false, message: 'ID do serviço não informado.' };
        }
        try {
            const changes = this.ServicoModel.atualizar(servico);
            if (changes > 0) {
                return { success: true, message: 'Serviço atualizado com sucesso!' };
            } else {
                return { success: false, message: 'Serviço não encontrado.' };
            }
        } catch (error) {
            console.error('[ServicoController] Erro ao editar:', error);
            return { success: false, message: 'Erro ao editar serviço.' };
        }
    }

    async excluir(id) {
        if (!id) {
            return { success: false, message: 'ID do serviço não informado.' };
        }
        try {
            const ok = this.ServicoModel.remover(id);
            if (ok) {
                return { success: true, message: 'Serviço excluído com sucesso!' };
            } else {
                return { success: false, message: 'Serviço não encontrado.' };
            }
        } catch (error) {
            console.error('[ServicoController] Erro ao excluir:', error);
            return { success: false, message: 'Erro ao excluir serviço.' };
        }
    }
}

export default ServicoController;