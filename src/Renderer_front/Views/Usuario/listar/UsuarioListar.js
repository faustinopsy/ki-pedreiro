import UsuariosView from "../UsuariosView.js"
import MensagemDeAlerta from "../../../Services/MensagemDeAlerta.js"
class UsuarioListar {
    constructor() {
        this.view = new UsuariosView();
        this.mensagem = new MensagemDeAlerta();

    }
    async renderizarLista() {
        const dados = await window.api.listar();
        console.log('dados na usuario lista', dados);

        return {
            html: this.view.renderizarLista(dados),
            init: () => this.adicionarEventos()
        };
    }
    adicionarEventos() {
        this.app = document.getElementById("container");
        if (!this.app) return; // Guard clause

        // Event delegation for table actions
        this.app.addEventListener("click", async (e) => {
            const target = e.target;
            const idUsuario = target.getAttribute("data-id");

            if (target.classList.contains("editar-user")) {
                console.log("editar usuario id:", idUsuario);
                const usuario = await window.api.buscarporid(idUsuario)

                const id = document.getElementById("id")
                const nome_usuario = document.getElementById("nome_usuario")
                const email_usuario = document.getElementById("email_usuario")

                if (usuario && id && nome_usuario && email_usuario) {
                    id.value = usuario.uuid
                    nome_usuario.value = usuario.nome_usuario
                    email_usuario.value = usuario.email_usuario
                    this.view.abrirModal();
                }
            }
            if (target.classList.contains("excluir-user")) {
                // Spinner/Visual Feedback should be handled here eventually
                const resultado = await window.api.removerUsuario(idUsuario);

                if (resultado.success) {
                    this.mensagem.sucesso(resultado.message);
                    window.location.reload();
                } else {
                    this.mensagem.erro(resultado.message || "Erro ao tentar excluir!")
                }
            }
        });

        // Modal specific events - outside of table delegation
        const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => this.view.fecharModal());
        });
        const formulario = document.getElementById('form-usuario');
        if (!formulario) return;

        formulario.addEventListener('submit', async (event) => {
            event.preventDefault();

            const id = document.getElementById('id');
            const nome_usuario = document.getElementById('nome_usuario');
            const email_usuario = document.getElementById('email_usuario');
            const usuario = {
                uuid: id.value,
                nome_usuario: nome_usuario.value,
                email_usuario: email_usuario.value
            }

            const resultado = await window.api.editarUsuario(usuario);
            if (resultado.success) {
                nome_usuario.value = '';
                email_usuario.value = '';
                this.mensagem.sucesso(resultado.message);
                this.view.fecharModal();
                window.location.reload(); // Refresh to show changes
            } else {
                this.mensagem.erro(resultado.message || "Erro ao atualizar!");
            }

        })


    }

}
export default UsuarioListar;