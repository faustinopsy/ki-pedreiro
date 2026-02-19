import db from '../Database/db.js';
import crypto from 'node:crypto';
class Usuarios {
  constructor() { }
  adicionar(usuario) {
    const uuid = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO usuarios (uuid, nome_usuario, email_usuario, tipo_usuario, sync_status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      uuid,
      usuario.nome_usuario,
      usuario.email_usuario,
      usuario.tipo_usuario || 'user',
      0
    );
    return info.lastInsertRowid;
  }
  async listarSincronizados() {
    const stmt = db.prepare(`SELECT * FROM usuarios WHERE sync_status = 1 AND excluido_em IS NULL`);
    return stmt.all();
  }
  async cadastrarLocalmente(usuarioRemoto) {
    const uuid = crypto.randomUUID();
    const stmt = db.prepare(`
            INSERT INTO usuarios (uuid, nome_usuario, email_usuario, tipo_usuario, sync_status)
            VALUES (?, ?, ?, ?, 1)
        `);
    stmt.run(uuid, usuarioRemoto.nome_usuario, usuarioRemoto.email_usuario, usuarioRemoto.tipo_usuario);

  }
  async listar(params = {}) {
    const { page = 1, limit = 10, search = '' } = params;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM usuarios WHERE excluido_em IS NULL`;
    let countQuery = `SELECT COUNT(*) as total FROM usuarios WHERE excluido_em IS NULL`;

    const bindings = [];

    if (search) {
      const searchTerm = `%${search}%`;
      const whereClause = ` AND (nome_usuario LIKE ? OR email_usuario LIKE ?)`;
      query += whereClause;
      countQuery += whereClause;
      bindings.push(searchTerm, searchTerm);
    }

    query += ` ORDER BY nome_usuario ASC LIMIT ? OFFSET ?`;

    try {
      const totalResult = db.prepare(countQuery).get(...bindings);
      const total = totalResult ? totalResult.total : 0;

      const data = db.prepare(query).all(...bindings, limit, offset);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      throw error;
    }
  }
  async buscarPorUUID(uuid) {
    console.log(uuid);
    const stmt = db.prepare(`SELECT * FROM usuarios WHERE uuid = ? AND excluido_em IS NULL`);
    return stmt.get(uuid);
  }
  async atualizar(usuarioAtualizado) {
    console.log('atualizar no model', usuarioAtualizado);
    const stmt = db.prepare(`UPDATE usuarios 
       SET nome_usuario = ?,
       email_usuario = ?,
       tipo_usuario = ?,
       atualizado_em = CURRENT_TIMESTAMP,
       sync_status = 0 
       WHERE uuid = ?`
    );
    const info = stmt.run(
      usuarioAtualizado.nome_usuario,
      usuarioAtualizado.email_usuario,
      usuarioAtualizado.tipo_usuario || 'user',
      usuarioAtualizado.uuid
    );
    return info.changes;
  }

  async remover(usuario) {
    const stmt = db.prepare(`UPDATE usuarios SET excluido_em = CURRENT_TIMESTAMP, sync_status = 0
      WHERE uuid = ?`);
    const info = stmt.run(usuario.uuid);
    //ternario
    return info.changes > 0 ? true : false;
  }

  listarPendentes() {
    const stmt = db.prepare(`
      SELECT * FROM usuarios 
      WHERE sync_status = 0 AND excluido_em IS NULL
    `);
    return stmt.all();
  }

  marcarComoSincronizado(uuid) {
    const stmt = db.prepare(`
      UPDATE usuarios 
      SET sync_status = 1, atualizado_em = CURRENT_TIMESTAMP 
      WHERE uuid = ?
    `);
    const info = stmt.run(uuid);
    return info.changes > 0;
  }

  async dashboardStats() {
    const total = db.prepare('SELECT COUNT(*) as count FROM usuarios WHERE excluido_em IS NULL').get().count;
    // Assuming 'active' logic is just non-deleted for now as per schema
    // If we had a specific status column we would use it. 
    // Let's rely on excluido_em for Active vs Inactive (deleted)
    // But usually Inactive users are kept but marked inactive. 
    // Since the user asked for Active/Inactive and we saw 'status_usuario' in the JSON from sync, 
    // let's check if we can infer it. 
    // If no status column exists in local DB (checked schema in logs), we can only count Total Active (non-deleted).
    // Let's return Total, and maybe "Sync Pending" as another stat?
    // User Update: The user requested "Active vs Inactive". 
    // Without a status column, I will treat ALL non-deleted users as Active for this version, 
    // OR if there is a 'sync_status' we can show that. 
    // Let's stick to the prompt: "mostre a quantidade de usuarios ativos e inativos".
    // I will count "deleted" (excluido_em IS NOT NULL) as Inactive for now to show some numbers?
    // Or better, let's treat "Inativo" as a concept we might not fully have but I will count 
    // "Total Registered" vs "Excluídos" (soft deleted).
    // actually, let's look at the logs again: "status_usuario: 'ativo'".
    // It seems the remote API sends it. If we don't store it, we can't count it locally.
    // The create table log shows: sync_status, criado_em, atualizado_em, excluido_em. NO status_usuario.
    // So I can only rely on excluido_em. 
    // Active = excluido_em IS NULL.
    // Inactive = excluido_em IS NOT NULL.

    const active = db.prepare('SELECT COUNT(*) as count FROM usuarios WHERE excluido_em IS NULL').get().count;
    const inactive = db.prepare('SELECT COUNT(*) as count FROM usuarios WHERE excluido_em IS NOT NULL').get().count;

    return {
      total: active + inactive,
      active: active,
      inactive: inactive
    };
  }

}
export default Usuarios;