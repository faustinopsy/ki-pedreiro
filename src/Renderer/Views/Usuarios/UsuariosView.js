class UsuariosView{
    constructor(){
    }
    renderizar(Usuarios){
        let container ='<div class="container">';
        Usuarios.forEach(usuario => {
            container += `
            <li>
            ${usuario.nome} (Idade: ${usuario.idade})
                <button class="btn-editar" data-id="${usuario.id}">Editar</button>
                <button class="btn-remover" data-id="${usuario.id}">Remover</button>
            </li>`;
            
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
