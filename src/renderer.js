import './index.css';
import Configuracao from './Renderer/Services/Configuracao.js';
import Rotas from './Renderer/Services/Rotas.js';
const config = new Configuracao();
await config.modoEscuro();

const mapaDeRotas = new Rotas();
const rotas = mapaDeRotas.rotas();

async function navegarPara(rota) {
  if (!rotas[rota]) {
    document.querySelector('#app').innerHTML = '<h1>404 - Página não encontrada</h1>';
    return;
  }
  document.querySelector('#app').innerHTML = '<h1>Carregando...</h1>';
  const html = await rotas[rota]();
  document.querySelector('#app').innerHTML = html;
}
window.addEventListener('hashchange', () => {
  // chegou #usuarios
  const rota = window.location.hash.replace('#', '/');
  // se trasforma em /usuarios
  navegarPara(rota);
});
//1º envia a url = hash
navegarPara('/servicos');
