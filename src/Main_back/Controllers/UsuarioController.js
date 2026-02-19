import Usuarios from '../Models/Usuarios.js';
import SyncService from '../Services/SyncService.js';

class UsuarioController {
    constructor() {
        this.usuarioModel = new Usuarios();
    }
    async listar(params = {}) {
        try {
            const dados = await this.usuarioModel.listar(params);
            return dados;
        } catch (error) {
            console.error("Erro ao listar usuários:", error);
            return { data: [], total: 0, page: 1, totalPages: 0 };
        }
    }
    async cadastrar(usuario) {
        if (!usuario.nome_usuario || !usuario.email_usuario) {
            return { success: false, message: "Campos obrigatórios não preenchidos." };
        }
        try {
            await this.usuarioModel.adicionar(usuario);
            return { success: true, message: "Usuário cadastrado com sucesso!" };
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            return { success: false, message: "Erro interno ao cadastrar usuário." };
        }
    }

    async sincronizar() {
        try {
            console.log('[UsuarioController] Iniciando sync...');
            const resultado = await SyncService.sincronizar('usuarios');
            if (resultado.success && resultado.dados) {
                // A API pode retornar paginado { data: { data: [...] } } ou direto
                // Rota /api/usuarios retorna paginado no Laravel geralmente
                let lista = [];
                if (Array.isArray(resultado.dados)) lista = resultado.dados;
                else if (Array.isArray(resultado.dados.data)) lista = resultado.dados.data;
                else if (resultado.dados.data && Array.isArray(resultado.dados.data.data)) lista = resultado.dados.data.data;

                await this.cadastrarLocalmente({ dados: { data: { data: lista } } });
                return { success: true, message: `${lista.length} usuários sincronizados.` };
            }
            return { success: false, message: resultado.error || 'Erro ao sincronizar.' };
        } catch (e) {
            console.error(e);
            return { success: false, message: e.message };
        }
    }

    async cadastrarLocalmente(dados) {
        // Adaptar para estrutura que vem do SyncService/API
        // Esperamos algo como { dados: { data: { data: [usuarios...] } } } ou array direto
        // O código anterior esperava a estrutura complexa do Laravel paginate

        let usuariosParaSalvar = [];
        if (dados && dados.dados && dados.dados.data && Array.isArray(dados.dados.data.data)) {
            usuariosParaSalvar = dados.dados.data.data;
        } else if (Array.isArray(dados)) {
            usuariosParaSalvar = dados;
        }

        if (usuariosParaSalvar.length === 0) return { success: true, message: "Nenhum usuário para salvar." };

        try {
            const usuariosExistentes = await this.usuarioModel.listarSincronizados();
            let novos = 0;
            for (const usuario of usuariosParaSalvar) {
                const emailAtual = usuario.email_usuario?.trim().toLowerCase();
                if (!emailAtual) continue;

                // Verifica duplicidade por e-mail (falho mas ok por enquanto)
                const jaExiste = usuariosExistentes.some(u => u.email_usuario.trim().toLowerCase() === emailAtual);

                if (!jaExiste) {
                    await this.usuarioModel.cadastrarLocalmente(usuario);
                    novos++;
                } else {
                    // Opcional: atualizar dados do usuário existente se o remoto for mais recente?
                    // Por simplicidade, ignoramos updates vindos do server por enquanto, como era antes.
                }
            }
            return { success: true, message: `Sincronização concluída. ${novos} novos usuários.` };
        } catch (error) {
            console.error("Erro na sincronização:", error);
            return { success: false, message: "Erro ao sincronizar dados." };
        }
    }

    async atualizarUsuario(usuario) {
        if (!usuario.nome_usuario || !usuario.email_usuario) {
            return { success: false, message: "Campos obrigatórios faltando." };
        }
        try {
            const usuarioExistente = await this.usuarioModel.buscarPorUUID(usuario.uuid);
            if (!usuarioExistente) {
                return { success: false, message: "Usuário não encontrado." };
            }
            await this.usuarioModel.atualizar(usuario);
            return { success: true, message: "Usuário atualizado com sucesso!" };
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            return { success: false, message: "Erro ao atualizar usuário." };
        }
    }

    async buscarUsuarioPorId(id) {
        if (!id) {
            return null;
        }
        return this.usuarioModel.buscarPorUUID(id)
    }

    async obterDadosDashboard() {
        try {
            return await this.usuarioModel.dashboardStats();
        } catch (error) {
            console.error("Erro ao obter stats:", error);
            return { total: 0, active: 0, inactive: 0 };
        }
    }


    async removerUsuario(uuid) {
        try {
            const usuarioExistente = await this.usuarioModel.buscarPorUUID(uuid);
            if (!usuarioExistente) {
                return { success: false, message: "Usuário não encontrado." };
            }
            await this.usuarioModel.remover(usuarioExistente)
            return { success: true, message: "Usuário removido com sucesso!" };
        } catch (error) {
            console.error("Erro ao remover:", error);
            return { success: false, message: "Erro ao remover usuário." };
        }
    }
}
export default UsuarioController;