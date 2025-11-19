import UsuariosView from '../UsuariosView';

class UsuarioListPage {
  constructor() {
    this.view = new UsuariosView(); 
  }
  async render() {
    const dados = await window.api.listarUsuarios();
    return this.view.renderizar(dados);
  }
  adicionarEventos() {
    this.appDiv.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn-editar')) {
      const id = e.target.getAttribute('data-id');
      window.location.hash = `#/formulario-usuarios/${id}`;
    }
});
  }
}
export default UsuarioListPage;