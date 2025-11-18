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
    console.log('Eventos da Lista de Usuários ativados.');
  }
}
export default UsuarioListPage;