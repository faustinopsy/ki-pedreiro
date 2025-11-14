class Configuracoes {
  constructor() { }
    modoEscuro() {
        document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
            await window.darkMode.toggle();
        })
    }
    statusDaRede() {
        document.getElementById('status').innerHTML = navigator.onLine ? 'online' : 'offline'
    }
    inicarEventos() {
        window.addEventListener('online', this.statusDaRede)
        window.addEventListener('offline', this.statusDaRede)
        this.statusDaRede()
    }
    async mostrarVersao() {
        const versao = await window.api.getAppVersion();
        document.getElementById('versao-app').innerText = versao;
    }
}
export default Configuracoes;