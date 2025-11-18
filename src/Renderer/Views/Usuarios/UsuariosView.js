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
    formulario(){
        return `<form id="form-add-usuario">
        <label>Nome:</label>
        <input type="text" name="nome" id="nome">
        <label>Idade:</label>
        <input type="number" name="idade" id="idade">
        <button type="submit">Enviar</button>
        </form>`;

    }
}
export default UsuariosView;