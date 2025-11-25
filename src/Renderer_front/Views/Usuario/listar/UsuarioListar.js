import UsuariosView from "../UsuariosView.js"
class UsuarioListar{
    constructor(){
        this.view = new UsuariosView();
    }
   async renderizarLista(){
        const dados = await window.api.listar();
        console.log('dados na usuario lista', dados);
        setTimeout(()=>{
            this.adicionarEventos();
        },0)
       return this.view.renderizarLista(dados)
    }
    adicionarEventos(){
        document.getElementById("editar-user").addEventListener("click", (e)=>{
            const idUsuario = e.target.getAttribute("data-id");
            console.log("editar usuario id:", idUsuario);
        })
        document.getElementById("excluir-user").addEventListener("click", (e)=>{
            const idUsuario = e.target.getAttribute("data-id");
            console.log("excluir usuario id:", idUsuario);
        })

    }

}
export default UsuarioListar;