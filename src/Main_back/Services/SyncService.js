import { net } from 'electron';
import UsuarioModel from '../Models/Usuarios.js';

const API_URL = 'http://localhost:8080/backend/api/usuarios';

class SyncService {
  constructor() {
    this.usuarioModel = new UsuarioModel();
  }

  async sincronizar() {
    if (!net.isOnline()) {
      console.log('[Sync] Sem internet. Abortando.');
      return { success: false, error: 'offline' };
    }

    try {

      console.log('[Sync] Enviando...');
      const response = await fetch(API_URL);

      if (!response.ok) throw new Error('Erro no servidor PHP');

      const data = await response.json();
      console.log('[Sync] Resposta recebida:', data.data);
    
     return { success: true, dados: data };

    } catch (error) {
      console.error('[Sync] Erro:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SyncService(); 