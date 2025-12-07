class UsuariosView{
    constructor(){
    }
    renderizarMenu(){
        return `<div class="container">
                    <ul>
                        <li><a href="#usuario_criar">Criar Usuário</a></li>
                        <li><a href="#usuario_listar">Listar Usuários</a></li>
                    </ul>
                </div>`;
    }



    renderizarLista(Usuarios){
        let container = `<div style="overflow-x:auto;" id="container">
                            <table>
                            <tr>
                              <th>nome_usuario</th><th>email_usuario</th><th>ações</th>
                            </tr>`;
        Usuarios.forEach(usuario => { // data = atributto
            container += `<tr><td> ${usuario.nome_usuario} </td><td> ${usuario.email_usuario} </td><td> 
            <button class="editar-user" data-id="${usuario.uuid}">Editar</button>
            <button class="excluir-user" data-id="${usuario.uuid}">Excluir</button> </td><tr>`
        });
        container += `</table></div>
        <div id="myModal" class="modal">
            <div class="modal-content">
                <span class="close" id="fechar">&times;</span>
                <form id="form-usuario">
                    <input type="text" id="id" hidden/>
                    <label>nome_usuario:</label>
                    <input type="text" id="nome_usuario"/>
                    <label>email_usuario:</label>
                    <input type="email" id="email_usuario"/>
                    <button>Salvar</button>
                </form>
            </div>
        </div>

        
        `;
        return container;
    }
    renderizarFomulario(){
        return `<form id="form-usuario">
                    <label>Nome:</label>
                    <input type="text" id="nome_usuario"/>
                    <label>E-mail:</label>
                    <input type="email" id="email_usuario"/>
                    <label>Tipo de usuário:</label>
                    <select id="tipo_usuario">
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                    <button>Salvar</button>
                </form>`

    }

    abrirModal(){
        const modal = document.getElementById("myModal")
        modal.style.display = "block"
    }

    fecharModal(){
        const modal = document.getElementById("myModal")
        modal.style.display = "none"
    }
}
export default UsuariosView;