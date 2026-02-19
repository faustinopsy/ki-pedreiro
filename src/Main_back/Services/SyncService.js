import { net } from 'electron';
import UsuarioModel from '../Models/Usuarios.js';

const API_URL = 'http://localhost:8000/backend/api/';

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
      console.log(`[Sync] Enviando requisição para ${url}...`);
      const response = await fetch(`${API_URL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.chaveAPI}`,
        },
      });

      // Lê como texto para não crashar se a API retornar HTML de erro PHP
      const rawText = await response.text();

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (_) {
        console.warn(`[Sync] Resposta não-JSON de "${url}":`, rawText.substring(0, 150));
        return { success: false, error: 'non_json_response' };
      }

      if (!response.ok) {
        console.error(`[Sync] Erro HTTP ${response.status} em "${url}"`, data);
        return { success: false, error: `HTTP ${response.status}` };
      }

      // Log discreto para não poluir
      const qtd = data.data?.length || (Array.isArray(data.data?.data) ? data.data.data.length : 0) || 0;
      console.log(`[Sync] Resposta recebida de ${url}: ${qtd} itens.`);
      return { success: true, dados: data };

    } catch (error) {
      console.error('[Sync] Erro de rede:', error.message);
      return { success: false, error: error.message };
    }
  }

  async enviarDadosLocais(tipo) {
    if (!net.isOnline()) {
      console.log('[Sync Upload] Sem internet. Tentaremos depois.');
      return;
    }

    let pendentes = [];
    let endpoint = '';
    let Model = null;

    if (tipo === 'usuariosalvar') {
      // Nota: O endpoint na API parece ser /usuariosalvar baseado no prompt, mas geralmente é /usuarios 
      // O prompt diz: (/api/servicos) e (/api/usuariosalvar)
      endpoint = 'usuariosalvar';
      Model = this.usuarioModel;
      pendentes = this.usuarioModel.listarPendentes();
    } else if (tipo === 'servicos') {
      endpoint = 'servicos';
      // Precisamos instanciar o model de servicos aqui ou injetar. 
      // Como o SyncService é singleton exportado com 'new', melhor importar a classe e instanciar se necessário,
      // ou adicionar o model de serviços ao construtor.
      // Vou importar dinamicamente ou adicionar ao construtor se possível.
      // Por simplicidade, vou importar ServicosModel no topo.
      const ServicosModel = (await import('../Models/Servicos.js')).default;
      Model = new ServicosModel();
      pendentes = Model.listarPendentes();
    } else {
      return;
    }

    if (pendentes.length === 0) {
      console.log(`[Sync Upload] Nada para enviar em ${tipo}.`);
      return;
    }

    console.log(`[Sync Upload] Enviando ${pendentes.length} registros para ${endpoint}...`);

    for (const item of pendentes) {
      try {
        let payload = {};

        if (tipo === 'usuariosalvar') {
          payload = {
            "nome_usuario": item.nome_usuario,
            "email_usuario": item.email_usuario,
            "senha_usuario": item.senha_usuario || '',
            "tipo_usuario": item.tipo_usuario || 'user',
            "status_usuario": 'ativo'
          };
        } else if (tipo === 'servicos') {
          payload = {
            "nome_servico": item.nome_servico,
            "descricao_servico": item.descricao_servico || "",
            "foto_servico": item.foto_servico || "",
            "caminho_imagem": item.caminho_imagem || "",
            "image_base64": item.image_base64 || null
          };
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.chaveAPI}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          // Tenta ler o erro, mas cuidado com HTML retornado por erro do PHP
          const text = await response.text();
          try {
            const erro = JSON.parse(text);
            console.error(`[Sync Upload] Erro ao enviar para ${endpoint}:`, erro);
          } catch (e) {
            console.error(`[Sync Upload] Erro não-JSON ao enviar para ${endpoint}:`, text.substring(0, 100));
          }
          continue;
        }

        const jsonResponse = await response.json();
        if (jsonResponse.status === 'success') {
          console.log(`[Sync Upload] Sucesso: Item sincronizado.`);
          // Marcar como sinc. Precisamos do ID ou UUID. 
          // O model de servicos precisa ter esse metodo.
          // O model de usuarios usa UUID.
          // O model de servicos no db.js não tem UUID explícito no create table que fiz, apenas ID.
          // Vou assumir que usamos ID para serviços por enquanto ou adicionar UUID.
          // Melhor usar o ID local para marcar.
          if (item.uuid) {
            Model.marcarComoSincronizado(item.uuid);
          } else if (item.id) {
            Model.marcarComoSincronizado(item.id);
          }
        }

      } catch (error) {
        console.error(`[Sync Upload] Falha de rede ao enviar item:`, error.message);
      }
    }
  }
}

export default new SyncService(); 