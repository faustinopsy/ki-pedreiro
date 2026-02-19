import UsuarioListar from "../Views/Usuario/listar/UsuarioListar.js"
import UsuarioForm from "../Views/Usuario/form/UsuarioForm.js"
import UsuariosView from "../Views/Usuario/UsuariosView.js";
import ServicosListar from "../Views/Servico/ServicosListar.js";
import OrcamentosListar from "../Views/Orcamento/OrcamentosListar.js";

class Rotas {
    constructor() {
        this.rotas = {
            "/usuario_listar": async () => new UsuarioListar().renderizarLista(),
            "/usuario_criar": () => new UsuarioForm().renderizarFormulario(),
            "/usuario_menu": async () => {
                const stats = await window.api.obterDadosDashboard();
                return new UsuariosView().renderizarMenu(stats);
            },
            "/servico_listar": async () => new ServicosListar().renderizarLista(),
            "/orcamento_listar": async () => new OrcamentosListar().renderizarLista(),
        }
    }
    async getPage(rota) {
        return await this.rotas[rota]();
    }
}
export default Rotas;