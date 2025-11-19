import UsuarioListar from "../Views/Usuarios/Listas/UsuarioListPage.js"
import UsuarioForm from "../Views/Usuarios/Forms/UsuarioFormPage.js"
class Rotas {
    constructor(){
        this.rotas={
            "/usuario_listar": async () =>{
                return new UsuarioListar().renderizarLista();
            },
            "/usuario_form": () =>{
                return new UsuarioForm().renderizarFormulario();
            }
        }
    }
    async getPage(rota){
      console.log(rota)
        // /usuario_listar
            // UsuarioListar()
        return await this.rotas[rota]();
    }
}
export default Rotas;