import UsuarioListPage from '../Views/Usuarios/Listas/UsuarioListPage.js';
import UsuarioFormPage from '../Views/Usuarios/Forms/UsuarioFormPage.js';

class Rotas {
  constructor() {
    this.rotas = {
      '/usuarios': UsuarioListPage,
      '/formulario-usuarios': UsuarioFormPage,
    };
  }

  getPagina(rota) {
    const PaginaClasse = this.rotas[rota];
    return PaginaClasse ? new PaginaClasse() : null;
  }
}
export default Rotas;