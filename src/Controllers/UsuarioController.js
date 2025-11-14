import usuarioModel from '../Models/Usuario.js';
import UsuarioView from '../Views/UsuarioView.js';
class UsuarioController {
    constructor() {
        this.usuarioModel = new usuarioModel();
        this.usuarioView = new UsuarioView();
        this.lista = [];
    }
    listar() {
        return this.usuarioModel.listar();
    }
    renderizar() {
        this.lista = this.usuarioModel.listar();
        return this.usuarioView.renderizar(this.lista);
    }
}
export default UsuarioController;