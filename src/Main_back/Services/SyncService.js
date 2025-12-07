import { net } from 'electron';
import UsuarioModel from '../Models/Usuarios.js';

const API_URL = 'http://localhost:8080/backend/api/';

class SyncService {
  constructor() {
    this.usuarioModel = new UsuarioModel();
    this.chaveAPI = '9D67A537A9329E0F1E9D088A1C991F1CC728EA87D3D154B409ED3320EA940303'; 
  }

  async sincronizar(url) {
    if (!net.isOnline()) {
      console.log('[Sync] Sem internet. Abortando.');
      return { success: false, error: 'offline' };
    }

    try {

      console.log('[Sync] Enviando...');
      const response = await fetch(`${API_URL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.chaveAPI}`,
        },
      });

      if (!response.ok) throw new Error('Erro no servidor PHP');

      const data = await response.json();
      console.log('[Sync] Resposta recebida:', data.data);
    
     return { success: true, dados: data };

    } catch (error) {
      console.error('[Sync] Erro:', error);
      return { success: false, error: error.message };
    }
  }

  async enviarDadosLocais(url) {
    if (!net.isOnline()) {
      console.log('[Sync Upload] Sem internet. Tentaremos depois.');
      return;
    }

    const pendentes = this.usuarioModel.listarPendentes();
    
    if (pendentes.length === 0) {
      console.log('[Sync Upload] Nada para enviar.');
      return;
    }

    console.log(`[Sync Upload] Enviando ${pendentes.length} registros...`);

    for (const usuario of pendentes) {
      try {

        const response = await fetch(`${API_URL}${url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.chaveAPI}`
          },
          body: JSON.stringify(usuario)
        });

        if (!response.ok) {
            const erro = await response.json();
            console.error(`[Sync Upload] Erro ao enviar ${usuario.nome}:`, erro);
            continue;
        }

        const jsonResponse = await response.json();
        if (jsonResponse.status === 'success') {
          console.log(`[Sync Upload] Sucesso: ${usuario.nome}`);
          this.usuarioModel.marcarComoSincronizado(usuario.uuid);
        }

      } catch (error) {
        console.error(`[Sync Upload] Falha de rede ao enviar ${usuario.nome}:`, error.message);
      }
    }
  }
}

export default new SyncService(); 