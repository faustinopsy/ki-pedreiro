import Servicos from '../Models/Servicos.js';
import { net } from 'electron';

class ServicoController {
    constructor() {
        this.ServicoModel = new Servicos();
    }

    listar() {
        return this.ServicoModel.listar();
    }

    async sincronizar() {
        try {
            console.log('[ServicoController] Iniciando sincronização de serviços...');
            const response = await fetch('http://localhost:8000/backend/api/servicos');

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
            }

            const resultado = await response.json();

            if (resultado.status === 'success' && Array.isArray(resultado.data)) {
                this.ServicoModel.cadastrarLocalmente(resultado.data);
                return { success: true, message: 'Serviços sincronizados com sucesso!', count: resultado.data.length };
            } else {
                console.warn('[ServicoController] Formato de resposta inesperado:', resultado);
                return { success: false, message: 'Formato de resposta inválido.' };
            }
        } catch (error) {
            console.error('[ServicoController] Erro ao sincronizar serviços:', error);
            return { success: false, message: error.message };
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
}

export default ServicoController;