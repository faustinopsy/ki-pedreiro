import Usuarios from '../Models/Usuarios.js';
class UsuarioController{
    constructor(){
        this.usuarioModel = new Usuarios();   
     }
    listar(){
        return this.usuarioModel.listar();
    }

}
export default UsuarioController;