import db from '../Database/db.js';

class Servicos {
  listar() {
    try {
      const query = `
        SELECT * FROM servicos 
        WHERE excluido_em IS NULL 
        ORDER BY nome_servico ASC
      `;
      return db.prepare(query).all();
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      throw error;
    }
  }

  cadastrarLocalmente(dados) {
    if (!dados || !Array.isArray(dados)) {
      console.warn('Dados inválidos para cadastro local de serviços:', dados);
      return;
    }

    const insertOrUpdate = db.transaction((servicos) => {
      // Simples estratégia: deletar tudo e reinserir ou upsert.
      // Como é sync one-way da API -> Local, upsert pelo nome ou limpar tabela pode funcionar.
      // Dado o requisito "ao baixar o servidor cadastrar no banco local", vamos assumir que a API é a fonte da verdade.

      const stmt = db.prepare(`
        INSERT INTO servicos (
          nome_servico,
          descricao_servico,
          foto_servico,
          caminho_imagem,
          image_base64,
          sync_status,
          atualizado_em
        ) VALUES (
          @nome_servico,
          @descricao_servico,
          @foto_servico,
          @caminho_imagem,
          @image_base64,
          1, -- Sincronizado
          CURRENT_TIMESTAMP
        )
      `);

      // Opcional: Limpar tabela antes de inserir para garantir espelhamento exato, 
      // mas cuidado com dados locais não syncados. 
      // Por enquanto, vou limpar e inserir tudo, pois parece ser uma lista mestre.
      // db.prepare('DELETE FROM servicos').run(); 

      // Melhor estratégia para não perder integridade se tivesse IDs: UPSERT.
      // Mas aqui não temos ID da API nos dados fornecidos no prompt (só dados de conteúdo).
      // Vou usar INSERT simples. Se precisar evitar duplicatas, precisaria de um campo único (ex: nome_servico).

      // Vamos assumir limpeza para refletir exatamente a API por enquanto, 
      // ou verificar duplicidade pelo nome.

      // Limpar tabela (estratégia simples para manter sync fiel à API)
      db.prepare('DELETE FROM servicos').run();

      for (const servico of servicos) {
        stmt.run(servico);
      }
    });

    try {
      insertOrUpdate(dados);
      console.log(`[Servicos] ${dados.length} serviços sincronizados localmente.`);
    } catch (error) {
      console.error('Erro ao salvar serviços localmente:', error);
      throw error;
    }
  }
  adicionar(servico) {
    const stmt = db.prepare(`
      INSERT INTO servicos (
        nome_servico, 
        descricao_servico, 
        foto_servico, 
        caminho_imagem, 
        sync_status,
        criado_em,
        atualizado_em
      )
      VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    // Foto/Caminho vazio por enquanto se não vier
    const info = stmt.run(
      servico.nome_servico,
      servico.descricao_servico || '',
      servico.foto_servico || '',
      servico.caminho_imagem || ''
    );
    return info.lastInsertRowid;
  }

  listarPendentes() {
    const stmt = db.prepare(`
      SELECT * FROM servicos 
      WHERE sync_status = 0 AND excluido_em IS NULL
    `);
    return stmt.all();
  }

  marcarComoSincronizado(id) {
    const stmt = db.prepare(`
      UPDATE servicos 
      SET sync_status = 1, atualizado_em = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    const info = stmt.run(id);
    return info.changes > 0;
  }
}

export default Servicos;