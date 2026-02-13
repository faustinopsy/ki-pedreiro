import { app, BrowserWindow, ipcMain, nativeTheme, net } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import UsuarioController from './Main_back/Controllers/UsuarioController.js';
import ServicoController from './Main_back/Controllers/ServicoController.js';
import { initDatabase } from './Main_back/Database/db.js';
import SyncService from './Main_back/Services/SyncService.js';
if (started) {
  app.quit();
}
const controlerUsuario = new UsuarioController();
const controlerServico = new ServicoController();

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    transparent: false,
    alwaysOnTop: false,
    resizable: true,
    fullscreen: false,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();
  initDatabase();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle("usuarios:buscarPorId", async (event, uuid) => {
    return await controlerUsuario.buscarUsuarioPorId(uuid);
  })

  ipcMain.handle("usuarios:removerusuario", async (event, uuid) => {
    return await controlerUsuario.removerUsuario(uuid);
  })

  ipcMain.handle("usuarios:listar", async (event, params) => {
    return await controlerUsuario.listar(params);
  })

  ipcMain.handle("usuarios:cadastrar", async (event, usuario) => {
    return await controlerUsuario.cadastrar(usuario);
  })

  // ... (outros handlers de usuario)

  // Serviços IPC
  ipcMain.handle("servicos:listar", async (event, params) => {
    return await controlerServico.listar(params);
  })



  ipcMain.handle("usuarios:editar", async (event, usuario) => {
    const resultado = await controlerUsuario.atualizarUsuario(usuario);
    return resultado;
  })

  ipcMain.handle("usuarios:dashboardStats", async () => {
    return await controlerUsuario.obterDadosDashboard();
  })

  // Serviços IPC


  ipcMain.handle("servicos:sincronizar", async () => {
    return await controlerServico.sincronizar();
  })


  ipcMain.handle("servicos:cadastrar", async (event, servico) => {
    return await controlerServico.cadastrar(servico);
  })

  // ipcMain.handle('app:sincronizar', async () => {
  //   console.log('[Main] Iniciando sincronização manual...');
  //   return await SyncService.sincronizar();
  // });

  async function sincronizarSeOnline() {
    const isOnline = net.isOnline();
    if (isOnline) {
      console.log('[Main] Aplicativo iniciado com internet. Iniciando sincronização automática...');
      await controlerUsuario.usuarioModel.cadastrarLocalmente(dados)

      const dadosServicos = await SyncService.sincronizar('servicos');
      if (dadosServicos.success && dadosServicos.dados.data) {
        await controlerServico.ServicoModel.cadastrarLocalmente(dadosServicos.dados.data);
      }
    }
  }
  sincronizarSeOnline();

  const INTERVALO_SYNC = 1000 * 60 * 1;

  const syncInterval = setInterval(async () => {
    console.log('[Main] Ciclo de auto-sync iniciado...');
    await SyncService.enviarDadosLocais('usuariosalvar');
    await SyncService.enviarDadosLocais('servicos');
    await SyncService.sincronizar('usuarios'); // Mantendo sync down de usuarios
    // Sync down de servicos também? O original só chamava SyncService.sincronizar() sem args na linha 107
    // Vou assumir que queremos manter atualizado
    // Mas SyncService.sincronizar requer URL. O original chamava sem args?
    // Linha 107 do original: await SyncService.sincronizar(); 
    // O metodo sincronizar(url) na linha 12 do SyncService requer url. 
    // Se chamar sem url -> fetch(undefined) -> erro. 
    // Provavelmente o código anterior estava incompleto ou com default.
    // Vou explicitar sync de servicos:
    const dadosServicos = await SyncService.sincronizar('servicos');
    if (dadosServicos.success && dadosServicos.dados.data) {
      await controlerServico.ServicoModel.cadastrarLocalmente(dadosServicos.dados.data);
    }
  }, INTERVALO_SYNC);

  app.on('before-quit', () => {
    clearInterval(syncInterval);
  });

});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
