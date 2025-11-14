import './index.css';
import UsuarioController from './Controllers/UsuarioController';
import ServicoView from './Views/ServicoView';
import Configuracoes from './Services/Configuracoes';
const configuracoes = new Configuracoes();
configuracoes.modoEscuro();
configuracoes.inicarEventos();
await configuracoes.mostrarVersao();

const rotas = {
    '/usuarios': UsuarioController,
    '/servicos': ServicoView,
}

function navegarPara(rota) {
    const ViewClass = new rotas[rota]();
    document.getElementById('app').innerHTML = ViewClass.renderizar();
    
  }
const rotaAtual =  '/servicos';
window.location.hash = rotaAtual;
navegarPara(rotaAtual);

window.addEventListener('hashchange', () => {
    const novaRota = window.location.hash.replace('#', '/');
    navegarPara(novaRota);
});