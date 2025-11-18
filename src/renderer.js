import './index.css';
import Rotas from './Renderer/Services/Rotas.js';
import Configuracao from './Renderer/Services/Configuracao.js';
const config = new Configuracao();
await config.modoEscuro();
config.verificarConexao();
const appDiv = document.getElementById('app');
const roteador = new Rotas();
async function navegarPara(rota) {
  const pagina = roteador.getPagina(rota); 
  if (pagina) {
    appDiv.innerHTML = '<h1>Carregando...</h1>';
    const html = await pagina.render();
    appDiv.innerHTML = html;
    pagina.adicionarEventos();
  } else {
    appDiv.innerHTML = '<h1>404 - Página não encontrada</h1>';
  }
}
window.addEventListener('hashchange', () => {
  const rota = window.location.hash.replace('#', '/');
  navegarPara(rota);
});
const rotaInicial = window.location.hash.replace('#', '/') || '/servicos';
navegarPara(rotaInicial);