class UsuariosView{
    constructor(){
    }
    renderizar(Usuarios){
        let container ='<div class="container">';
        Usuarios.forEach(usuario => {
            container += `<div> ${usuario.nome} - ${usuario.idade} </div><br/>`
        });
        container += '</div>';
        return container;
    }
}
export default UsuariosView;