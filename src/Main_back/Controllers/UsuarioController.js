import Usuarios from '../Models/Usuarios.js';
class UsuarioController{
    constructor(){
        this.usuarioModel = new Usuarios();
    }
    async listar(){
        const dados = await this.usuarioModel.listar();
        console.log('dados no controller', dados);
        return dados
    }
    async cadastrar(usuario){
        if(!usuario.nome_usuario || !usuario.email_usuario){
            return false;
        }
        this.usuarioModel.adicionar(usuario);
        return true;
    }
    async cadastrarLocalmente(dados) {
        if (!dados || !dados.dados?.data?.data) {
            return false;
        }
        const usuariosExistentes = await this.usuarioModel.listarSincronizados();
        for (const usuario of dados.dados.data.data) {
            const emailAtual = usuario.email_usuario?.trim().toLowerCase();
            if (!emailAtual) continue;
            const jaExiste = usuariosExistentes.some(usuarioExistente => {
                return usuarioExistente.email_usuario.trim().toLowerCase() === emailAtual;
            });
            if (!jaExiste) {
                await this.usuarioModel.cadastrarLocalmente(usuario);
                console.log(`Usuário cadastrado localmente: ${emailAtual}`);
            } else {
                console.log(`Usuário já existe localmente (pulando): ${emailAtual}`);
            }
        }
        return true;
    }
    async atualizarUsuario(usuario){
        if(!usuario.nome_usuario || !usuario.email_usuario){
            return false;
        }
        console.log('chegou no controller',usuario)
        const usuarioExistente = await this.usuarioModel.buscarPorUUID(usuario.uuid);
        console.log('usuario retornado da model',usuarioExistente)
        if(!usuarioExistente){
            return false;
        }
        const resultado = await this.usuarioModel.atualizar(usuario);
        return resultado;
    }

    async buscarUsuarioPorId(id){
        console.log(id)
        if(!id){
            return false
        }
       return this.usuarioModel.buscarPorUUID(id)
    }


    async removerUsuario(uuid){
        const usuarioExistente = await this.usuarioModel.buscarPorUUID(uuid);
        if(!usuarioExistente){
            return false
        }
        console.log("usuario a ser removido",usuarioExistente)
        debugger
        const resultado = await this.usuarioModel.remover(usuarioExistente)
        return resultado
    }

}
export default UsuarioController;