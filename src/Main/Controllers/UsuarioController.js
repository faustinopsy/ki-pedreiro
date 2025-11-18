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
}
export default UsuarioController;