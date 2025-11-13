import './index.css';
import UsuarioView from './Views/UsuarioView';
import ServicoView from './Views/ServicoView';

const rotas = {
    '/usuarios': UsuarioView,
    '/servicos': ServicoView,
}

function navegarPara(rota) {
    const ViewClass = new rotas[rota]();
    document.getElementById('app').innerHTML = ViewClass.renderizar();
    
  }
const rotaAtual = window.location.hash.replace('#', '/') || '/servicos';
window.location.hash = rotaAtual;
navegarPara(rotaAtual);

window.addEventListener('hashchange', () => {
    const novaRota = window.location.hash.replace('#', '/');
    navegarPara(novaRota);
});