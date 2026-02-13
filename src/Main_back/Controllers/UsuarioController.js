import Usuarios from '../Models/Usuarios.js';

class UsuarioController {
    constructor() {
        this.usuarioModel = new Usuarios();
    }
    async listar() {
        try {
            const dados = await this.usuarioModel.listar();
            return dados;
        } catch (error) {
            console.error("Erro ao listar usuários:", error);
            return [];
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
    async cadastrarLocalmente(dados) {
        if (!dados || !dados.dados?.data?.data) {
            return { success: false, message: "Dados inválidos." };
        }
        try {
            const usuariosExistentes = await this.usuarioModel.listarSincronizados();
            for (const usuario of dados.dados.data.data) {
                const emailAtual = usuario.email_usuario?.trim().toLowerCase();
                if (!emailAtual) continue;
                const jaExiste = usuariosExistentes.some(usuarioExistente => {
                    return usuarioExistente.email_usuario.trim().toLowerCase() === emailAtual;
                });
                if (!jaExiste) {
                    await this.usuarioModel.cadastrarLocalmente(usuario);
                }
            }
            return { success: true, message: "Sincronização concluída." };
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