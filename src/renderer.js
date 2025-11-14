import './index.css';
import UsuarioController from './Controllers/UsuarioController.js'
import ServicoController from './Controllers/ServicoController.js'
import Configuracao from './Services/Configuracao.js';

const config = new Configuracao();
await config.modoEscuro();

const rotas = {
  '/servicos': ServicoController,
  '/usuarios': UsuarioController,
};
function navegarPara(rota){
                            //usuarios
  const controller = new rotas[rota]();
                  // new UsuarioController()
  //                 2º envia a url = hash
  document.querySelector('#app').innerHTML = controller.listar();
}

window.addEventListener('hashchange', () => {
  // chegou #usuarios
  const rota = window.location.hash.replace('#', '/');
  // se trasforma em /usuarios
  navegarPara(rota);
});
//1º envia a url = hash
navegarPara('/servicos');
