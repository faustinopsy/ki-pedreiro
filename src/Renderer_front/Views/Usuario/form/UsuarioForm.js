import UsuariosView from "../UsuariosView.js";
import MensagemDeAlerta from "../../../Services/MensagemDeAlerta.js";
class UsuarioForm{
    constructor(){
        this.view = new UsuariosView();
        this.mensagem = new MensagemDeAlerta();
    }
    renderizarFormulario(){
        setTimeout(() => {
            this.adicionarEventos();
            console.log("evento criado")
        }, 0);
        return this.view.renderizarFomulario();
    }
    adicionarEventos(){
        const formulario = document.getElementById('form-usuario');
        formulario.addEventListener('submit', async (event) =>{
            event.preventDefault();
            console.log(event)
            const nome_usuario = document.getElementById('nome_usuario');
            const email_usuario = document.getElementById('email_usuario');
            const usuario = {
                nome_usuario: nome_usuario.value,
                email_usuario: email_usuario.value
            }
            const resultado = await window.api.cadastrar(usuario);
           if(resultado){
             nome_usuario.value = '';
             email_usuario.value = '';
             this.mensagem.sucesso();
           }else{
             this.mensagem.erro();
           }
            
        })
    }
}
export default UsuarioForm;