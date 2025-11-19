import UsuariosView from '../UsuariosView.js';

class UsuarioPage {
  constructor() {
    this.view = new UsuariosView();
    this.appDiv = document.getElementById('app');

  }

  async renderizarLista() {
    const usuarios = await window.api.listarUsuarios();
    setTimeout(() => {
            this.adicionarEventos();
        }, 0);
    return this.view.renderizar(usuarios);

  }

  adicionarEventos() {
    document.getElementById('btn-novo-usuario').addEventListener('click', () => {
      this.abrirModal();
    });

    document.getElementById('btn-cancelar').addEventListener('click', () => {
      this.fecharModal();
    });

    document.getElementById('form-usuario').addEventListener('submit', (e) => this.salvar(e));

    this.appDiv.addEventListener('click', async (e) => {
      const target = e.target;
      const id = target.getAttribute('data-id');

      if (target.classList.contains('btn-editar')) {
        await this.carregarDadosParaEdicao(id);
      }
      
      if (target.classList.contains('btn-remover')) {
        this.remover(id);
      }
    });
  }


  abrirModal() {
    document.getElementById('modal-usuario').classList.remove('hidden');
  }

  fecharModal() {
    document.getElementById('modal-usuario').classList.add('hidden');
    document.getElementById('form-usuario').reset(); 
    document.getElementById('usuario-id').value = '';
  }

  async carregarDadosParaEdicao(id) {
    const usuario = await window.api.buscarUsuarioPorId(id);
    
    if (usuario) {
      document.getElementById('usuario-id').value = usuario.id;
      document.getElementById('usuario-nome').value = usuario.nome;
      document.getElementById('usuario-idade').value = usuario.idade;
      
      document.getElementById('modal-titulo').innerText = 'Editar Usuário';
      this.abrirModal();
    }
  }

  async salvar(e) {
    e.preventDefault();
    
    const id = document.getElementById('usuario-id').value;
    const nome = document.getElementById('usuario-nome').value;
    const idade = document.getElementById('usuario-idade').value;

    const dados = { nome, idade };
    let resultado;

    if (id) {
      dados.id = id;
      resultado = await window.api.atualizarUsuario(dados);
    } else {
      resultado = await window.api.adicionarUsuario(dados);
    }

    if (resultado.success) {
      this.fecharModal();
      this.renderizarLista(); 
    } else {
      alert('Erro: ' + resultado.error);
    }
  }

  async remover(id) {
    if(confirm("Tem certeza?")) {
       await window.api.removerUsuario(id);
       this.renderizarLista();
    }
  }
}

export default UsuarioPage;