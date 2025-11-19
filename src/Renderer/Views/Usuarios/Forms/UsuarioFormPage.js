import UsuariosView from '../UsuariosView.js';

class UsuarioFormPage {
  constructor() {
    this.view = new UsuariosView();
  }

  async renderizarFormulario(id = null) {
    this.idEdicao = id;
    setTimeout(() => {
            this.adicionarEventos();
        }, 0);
    return this.view.formulario();
  }

  async adicionarEventos(id = null) {
    const form = document.getElementById('form-add-usuario');
    if (id) {
      document.querySelector('h3').innerText = 'Editar Usuário';
      const usuario = await window.api.buscarUsuarioPorId(id);
      if (usuario) {
        document.getElementById('usuario-nome').value = usuario.nome;
        document.getElementById('usuario-idade').value = usuario.idade;
      }
    }

    if (form) {
      form.addEventListener('submit', this.handleSalvar.bind(this));
    }
  }

  async handleSalvar(event) {
    event.preventDefault();
    const nome = document.getElementById('usuario-nome').value;
    const idade = document.getElementById('usuario-idade').value;
    
    const dados = { nome, idade };
    let resultado;

    if (this.idEdicao) {
      dados.id = this.idEdicao;
      resultado = await window.api.atualizarUsuario(dados);
    } else {
      resultado = await window.api.adicionarUsuario(dados);
    }

    if (resultado.success) {
      alert(this.idEdicao ? 'Usuário atualizado!' : 'Usuário criado!');
      window.location.hash = '#/usuarios';
    } else {
      alert('Erro: ' + resultado.error);
    }
  }
}

export default UsuarioFormPage;