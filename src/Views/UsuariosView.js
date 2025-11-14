class UsuariosView{
    constructor(Usuarios){
        this.usuarios = Usuarios;
    }
    renderizar(){
        const Usuarios = this.usuarios.listar();
        let container ='<div class="container">';
        Usuarios.forEach(usuario => {
            container += `<div> ${usuario.nome} - ${usuario.idade} </div><br/>`
        });
        container += '</div>';
        return container;
    }
}
export default UsuariosView;