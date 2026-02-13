import UsuarioListar from "../Views/Usuario/listar/UsuarioListar.js"
import UsuarioForm from "../Views/Usuario/form/UsuarioForm.js"
import UsuariosView from "../Views/Usuario/UsuariosView.js";
import ServicosListar from "../Views/Servico/ServicosListar.js";

class Rotas {
    constructor() {
        this.rotas = {
            // chave         : valor
            "/usuario_listar": async () => {
                return new UsuarioListar().renderizarLista();
            },
            "/usuario_criar": () => {
                return new UsuarioForm().renderizarFormulario();
            },
            "/usuario_menu": async () => {
                const stats = await window.api.obterDadosDashboard();
                return new UsuariosView().renderizarMenu(stats);
            },
            "/servico_listar": async () => {
                return await new ServicosListar().renderizarLista();
            }
        }
    }
    async getPage(rota) {
        // /usuario_listar
        // UsuarioListar()
        return await this.rotas[rota]();
    }
}
export default Rotas;