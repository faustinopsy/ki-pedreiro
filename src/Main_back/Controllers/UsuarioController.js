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
        if(!usuario.nome || !usuario.idade){
            return false;
        }
        this.usuarioModel.adicionar(usuario);
        return true;
    }
    async atualizarUsuario(usuario){
        if(!usuario.nome || !usuario.idade){
            return false;
        }
        const usuarioExistente = await this.usuarioModel.buscarPorId(usuario.id);
        if(!usuarioExistente){
            return false;
        }
        const resultado = this.usuarioModel.atualizar(usuario);
        return resultado;
    }

    async buscarUsuarioPorId(id){
        if(!id){
            return false
        }
       return this.usuarioModel.buscarPorId(id)
    }

}
export default UsuarioController;