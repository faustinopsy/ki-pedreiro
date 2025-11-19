class UsuariosView {
  renderizar(usuarios) {
    let html = `
      <div class="toolbar">
        <h2>Gerenciar Usuários</h2>
        <button id="btn-novo-usuario">Novo Usuário</button>
      </div>
      <hr>
    `;

    html += '<ul class="container">';
    usuarios.forEach(u => {
      html += `
        <li>
          ${u.nome} (${u.idade} anos)<a class="btn-editar" data-id="${u.id}">Editar</a> <a class="btn-remover" data-id="${u.id}">Excluir</a>
        </li>`;
    });
    html += '</ul>';

    html += `
      <div id="modal-usuario" class="modal-overlay hidden">
        <div class="modal-content">
          <h3 id="modal-titulo">Usuário</h3>
          <form id="form-usuario">
            <input type="hidden" id="usuario-id">
            
            <div class="campo">
              <label>Nome:</label>
              <input type="text" id="usuario-nome" required>
            </div>
            
            <div class="campo">
              <label>Idade:</label>
              <input type="number" id="usuario-idade" required>
            </div>

            <div class="acoes">
              <button type="submit">Salvar</button>
              <button type="button" id="btn-cancelar">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    `;

    return html;
  }
}
export default UsuariosView;