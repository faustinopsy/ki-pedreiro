import UsuariosView from './../Views/UsuariosView.js';
import ServicosView from './../Views/ServicosView.js';
class Rotas{
    constructor(){
        this.usuariosView = new UsuariosView();
        this.servicosView = new ServicosView();
        this.rota = {
        '/servicos': async () => {
            const dados = await window.api.listarServicos();
            return this.servicosView.renderizar(dados);
        },
        '/usuarios': async () => {
            const dados = await window.api.listarUsuarios();
            return this.usuariosView.renderizar(dados);
        },
        };
    }
    rotas(){
        return this.rota;
    }}
export default Rotas;