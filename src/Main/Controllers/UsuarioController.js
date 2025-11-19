import Usuarios from '../Models/Usuarios.js';
class UsuarioController{
    constructor(){
        this.usuarioModel = new Usuarios();   
     }
    listar(){
        return this.usuarioModel.listar();
    }
    adicionar(dados){
        return this.usuarioModel.adicionar(dados);
    }
    buscarPorId(id) {
        return this.usuarioModel.buscarPorId(id);
    }
    atualizar(usuario) {
        if (!usuario.id || !usuario.nome) throw new Error('Dados inválidos');
        
        const sucesso = this.usuarioModel.atualizar(usuario);
        if (!sucesso) throw new Error('Usuário não encontrado');
        
        return { success: true };
    }
}
export default UsuarioController;