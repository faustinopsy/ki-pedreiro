import UsuariosView from "../UsuariosView.js"
import MensagemDeAlerta from "../../../Services/MensagemDeAlerta.js" 
class UsuarioListar{
    constructor(){
        this.view = new UsuariosView();
        this.mensagem = new MensagemDeAlerta();
        
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
        this.app = document.getElementById("container");
        this.app.addEventListener("click", async (e)=>{
            const idUsuario = e.target.getAttribute("data-id");
            if(e.target.classList.contains("editar-user")){
                console.log("editar usuario id:", idUsuario);
                const usuario = await window.api.buscarporid(idUsuario)
                 const id = document.getElementById("id")
                const nome_usuario = document.getElementById("nome_usuario")
                const email_usuario = document.getElementById("email_usuario")
                id.value = usuario.uuid
                nome_usuario.value = usuario.nome_usuario
                email_usuario.value = usuario.email_usuario
                this.view.abrirModal();
            }
             if(e.target.classList.contains("excluir-user")){
               const resultado = await window.api.removerUsuario(idUsuario);
               console.log(resultado)
               if(resultado){
                    this.mensagem.sucesso("Excluído com sucesso!");
                    setTimeout(async ()=>{
                      document.getElementById("app").innerHTML = await this.renderizarLista();
                    },1500)
                    return true
               }else{
                    this.mensagem.erro("Erro ao tentar excluir!")
               }
            }
            if(e.target.classList.contains("close")){
                this.view.fecharModal();
            }
        })
        const formulario = document.getElementById('form-usuario');
        formulario.addEventListener('submit', async (event) =>{
            event.preventDefault();
            console.log(event)
            const id = document.getElementById('id');
            const nome_usuario = document.getElementById('nome_usuario');
            const email_usuario = document.getElementById('email_usuario');
            const usuario = {
                uuid: id.value,
                nome_usuario: nome_usuario.value,
                email_usuario: email_usuario.value
            }
            console.log(usuario)
            const resultado = await window.api.editarUsuario(usuario);
           if(resultado){
             nome_usuario.value = '';
             email_usuario.value = '';
             this.mensagem.sucesso("Atualizado com sucesso!");
           }else{
             this.mensagem.erro("Erro ao atualizar!");
           }
            
        })


    }

}
export default UsuarioListar;