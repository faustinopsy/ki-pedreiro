import db from '../Database/db.js';

class Servicos {
  listar(params = {}) {
    const { page = 1, limit = 10, search = '', tipo_servico = '' } = params;
    const offset = (page - 1) * limit;

    try {
      let query = `SELECT * FROM servicos WHERE excluido_em IS NULL`;
      let countQuery = `SELECT COUNT(*) as total FROM servicos WHERE excluido_em IS NULL`;
      const bindings = [];

      if (search) {
        const searchTerm = `%${search}%`;
        const clause = ` AND (nome_servico LIKE ? OR descricao_servico LIKE ?)`;
        query += clause;
        countQuery += clause;
        bindings.push(searchTerm, searchTerm);
      }

      if (tipo_servico) {
        query += ` AND tipo_servico = ?`;
        countQuery += ` AND tipo_servico = ?`;
        bindings.push(tipo_servico);
      }

      query += ` ORDER BY nome_servico ASC LIMIT ? OFFSET ?`;

      const totalResult = db.prepare(countQuery).get(...bindings);
      const total = totalResult ? totalResult.total : 0;
      const data = db.prepare(query).all(...bindings, limit, offset);

      return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      throw error;
    }
  }

  listarPorTipo(tipo) {
    return db.prepare(
      `SELECT id, nome_servico, descricao_servico FROM servicos
       WHERE tipo_servico = ? AND excluido_em IS NULL ORDER BY nome_servico ASC`
    ).all(tipo);
  }

  adicionar(servico) {
    const stmt = db.prepare(`
      INSERT INTO servicos (
        nome_servico, descricao_servico, foto_servico,
        caminho_imagem, image_base64, tipo_servico,
        sync_status, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const info = stmt.run(
      servico.nome_servico,
      servico.descricao_servico || '',
      servico.foto_servico || '',
      servico.caminho_imagem || '',
      servico.image_base64 || null,
      servico.tipo_servico || 'vitrine'
    );
    return info.lastInsertRowid;
  }

  atualizar(servico) {
    const stmt = db.prepare(`
      UPDATE servicos
      SET nome_servico = ?,
          descricao_servico = ?,
          image_base64 = ?,
          tipo_servico = ?,
          sync_status = 0,
          atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const info = stmt.run(
      servico.nome_servico,
      servico.descricao_servico || '',
      servico.image_base64 || null,
      servico.tipo_servico || 'vitrine',
      servico.id
    );
    return info.changes;
  }

  remover(id) {
    const stmt = db.prepare(`
      UPDATE servicos SET excluido_em = CURRENT_TIMESTAMP, sync_status = 0 WHERE id = ?
    `);
    const info = stmt.run(id);
    return info.changes > 0;
  }

  listarPendentes() {
    return db.prepare(`SELECT * FROM servicos WHERE sync_status = 0 AND excluido_em IS NULL`).all();
  }

  marcarComoSincronizado(id) {
    const info = db.prepare(
      `UPDATE servicos SET sync_status = 1, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(id);
    return info.changes > 0;
  }

  cadastrarLocalmente(dados) {
    if (!dados || !Array.isArray(dados)) return;
    const insertTx = db.transaction((servicos) => {
      db.prepare('DELETE FROM servicos').run();
      const stmt = db.prepare(`
        INSERT INTO servicos (
          nome_servico, descricao_servico, foto_servico,
          caminho_imagem, image_base64, tipo_servico,
          sync_status, atualizado_em
        ) VALUES (
          @nome_servico, @descricao_servico, @foto_servico,
          @caminho_imagem, @image_base64, @tipo_servico,
          1, CURRENT_TIMESTAMP
        )
      `);
      for (const s of servicos) {
        stmt.run({
          nome_servico: s.nome_servico || '',
          descricao_servico: s.descricao_servico || '',
          foto_servico: s.foto_servico || '',
          caminho_imagem: s.caminho_imagem || '',
          image_base64: s.image_base64 || null,
          tipo_servico: s.tipo_servico || 'vitrine'
        });
      }
    });
    try {
      insertTx(dados);
      console.log(`[Servicos] ${dados.length} serviços sincronizados.`);
    } catch (err) {
      console.error('[Servicos] Erro ao salvar localmente:', err);
      throw err;
    }
  }
}

export default Servicos;