class UsuarioView {
    constructor() {
    }    
    renderizar(usuarios){
        let html = '<ul class="container">';
        usuarios.forEach(usuario => {
            html += `<li>${usuario.nome}</li>`;
        });
        html += '</ul>';
        return html;
    }
}
export default UsuarioView;