import { app, BrowserWindow, ipcMain, nativeTheme, net } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import UsuarioController from './Main_back/Controllers/UsuarioController.js';
import ServicoController from './Main_back/Controllers/ServicoController.js';
import OrcamentoController from './Main_back/Controllers/OrcamentoController.js';
import { initDatabase } from './Main_back/Database/db.js';
import SyncService from './Main_back/Services/SyncService.js';

if (started) app.quit();

const controlerUsuario = new UsuarioController();
const controlerServico = new ServicoController();
const controlerOrcamento = new OrcamentoController();

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
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

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

app.whenReady().then(() => {
  createWindow();
  initDatabase();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // ── Dark Mode ────────────────────────────────────────────────
  ipcMain.handle('dark-mode:toggle', () => {
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark';
    return nativeTheme.shouldUseDarkColors;
  });

  // ── Usuários ─────────────────────────────────────────────────
  ipcMain.handle("usuarios:listar", async (_, params) =>
    controlerUsuario.listar(params));

  ipcMain.handle("usuarios:cadastrar", async (_, usuario) =>
    controlerUsuario.cadastrar(usuario));

  ipcMain.handle("usuarios:buscarPorId", async (_, uuid) =>
    controlerUsuario.buscarUsuarioPorId(uuid));

  ipcMain.handle("usuarios:editar", async (_, usuario) =>
    controlerUsuario.atualizarUsuario(usuario));

  ipcMain.handle("usuarios:removerusuario", async (event, uuid) => {
    return await controlerUsuario.removerUsuario(uuid);
  })

  ipcMain.handle("usuarios:sincronizar", async () => {
    return await controlerUsuario.sincronizar();
  })

  ipcMain.handle("usuarios:dashboardStats", async () =>
    controlerUsuario.obterDadosDashboard());

  // ── Serviços ──────────────────────────────────────────────────
  ipcMain.handle("servicos:listar", async (_, params) =>
    controlerServico.listar(params));

  ipcMain.handle("servicos:cadastrar", async (_, servico) =>
    controlerServico.cadastrar(servico));

  ipcMain.handle("servicos:editar", async (_, servico) =>
    controlerServico.editar(servico));

  ipcMain.handle("servicos:excluir", async (_, id) =>
    controlerServico.excluir(id));

  ipcMain.handle("servicos:sincronizar", async () =>
    controlerServico.sincronizar());

  ipcMain.handle("servicos:listarTrabalho", async () =>
    controlerOrcamento.listarServicosTrabalho());

  // ── Orçamentos ────────────────────────────────────────────────
  ipcMain.handle("orcamentos:listar", async (_, params) =>
    controlerOrcamento.listar(params));

  ipcMain.handle("orcamentos:cadastrar", async (_, orcamento) =>
    controlerOrcamento.cadastrar(orcamento));

  ipcMain.handle("orcamentos:editar", async (_, orcamento) =>
    controlerOrcamento.editar(orcamento));

  ipcMain.handle("orcamentos:excluir", async (_, id) =>
    controlerOrcamento.excluir(id));

  ipcMain.handle("orcamentos:buscar", async (_, id) =>
    controlerOrcamento.buscarPorId(id));

  ipcMain.handle("orcamentos:listarClientes", async () =>
    controlerOrcamento.listarClientes());

  // ── Auto-Sync (1 min) ────────────────────────────────────────
  async function sincronizarSeOnline() {
    if (!net.isOnline()) return;
    console.log('[Main] Online. Executando sync inicial...');
    const dadosServicos = await SyncService.sincronizar('servicos');
    if (dadosServicos.success && dadosServicos.dados?.data) {
      controlerServico.ServicoModel.cadastrarLocalmente(dadosServicos.dados.data);
    }
  }
  sincronizarSeOnline();

  const syncInterval = setInterval(async () => {
    console.log('[Main] Auto-sync...');
    await SyncService.enviarDadosLocais('usuariosalvar');
    await SyncService.enviarDadosLocais('servicos');
    const dadosServicos = await SyncService.sincronizar('servicos');
    if (dadosServicos.success && dadosServicos.dados?.data) {
      controlerServico.ServicoModel.cadastrarLocalmente(dadosServicos.dados.data);
    }
  }, 60_000);

  app.on('before-quit', () => clearInterval(syncInterval));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
