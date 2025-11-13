import Usuario from '../Models/Usuario.js';
class UsuarioView {
    constructor() {
        this.usuarioModel = new Usuario();
    }   
    listarUsuarios() {
        return this.usuarioModel.listar();
    }
    mostrarDetalhes(id) {
        return this.usuarioModel.buscarPorId(id);
    }
    renderizar(){
        const usuarios = this.listarUsuarios();
        let html = '<ul>';
        usuarios.forEach(usuario => {
            html += `<li>${usuario.nome}</li>`;
        });
        html += '</ul>';
        return html;
    }
}
export default UsuarioView;