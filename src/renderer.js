import './index.css';
import Rotas from './Renderer_front/Services/Rotas.js';
import Configuracao from './Renderer_front/Services/Configuracao.js';

const config = new Configuracao();
await config.modoEscuro();

const rota_mapeada = new Rotas();

// Global Utils
window.utils = {
  toggleSpinner: (show) => {
    const spinner = document.getElementById('global-spinner');
    if (show) {
      spinner.classList.remove('hidden');
    } else {
      spinner.classList.add('hidden');
    }
  }
};

async function navegarPara(rota) {
  // Visual Feedback: Active Link
  const links = document.querySelectorAll('#sidebar ul li a');
  links.forEach(link => {
    const href = link.getAttribute('href').replace('#', '/');
    if (href === rota) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });

  window.utils.toggleSpinner(true);
  try {
    const resposta = await rota_mapeada.getPage(rota);

    if (resposta && typeof resposta === 'object' && resposta.html) {
      document.querySelector('#app').innerHTML = resposta.html;
      if (typeof resposta.init === 'function') {
        resposta.init();
      }
    } else {
      document.querySelector('#app').innerHTML = resposta || "Erro ao carregar página.";
    }
  } catch (error) {
    console.error(error);
    document.querySelector('#app').innerHTML = "<div class='error-state'><h2>Erro ao carregar view</h2><p>" + error.message + "</p></div>";
  } finally {
    window.utils.toggleSpinner(false);
  }
}

window.addEventListener('hashchange', async () => {
  const rota = window.location.hash.replace('#', '/');
  await navegarPara(rota);
});

// Initial load
const initialRoute = window.location.hash ? window.location.hash.replace('#', '/') : '/usuario_menu';
if (!window.location.hash) {
  window.location.hash = '#usuario_menu';
} else {
  navegarPara(initialRoute);
}
