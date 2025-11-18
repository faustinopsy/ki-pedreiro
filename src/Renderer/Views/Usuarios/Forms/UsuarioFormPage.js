import UsuariosView from '../UsuariosView.js';
class UsuarioFormPage {
  constructor() {
    this.view = new UsuariosView();
  }
  render() {
    return this.view.formulario();
  }
  adicionarEventos() {
    const form = document.getElementById('form-add-usuario');
    if (form) {
      form.addEventListener('submit', this.eventoSalvarUsuario.bind(this));
    }
  }
  async eventoSalvarUsuario(event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value;
    const idade = parseInt(document.getElementById('idade').value, 10);
    if (!nome || !idade) {
      alert('Preencha os campos!');
      return;
    }
    const resultado = await window.api.adicionarUsuario({ nome, idade });
    if (resultado.success) {
      alert('Usuário salvo!');
      document.getElementById('form-add-usuario').reset();
      window.location.hash = '#usuarios';
    } else {
      alert(`Erro ao salvar: ${resultado.error}`);
    }
  }
}
export default UsuarioFormPage;