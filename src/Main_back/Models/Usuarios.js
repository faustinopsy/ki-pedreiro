import db from '../Database/db.js';
import crypto from 'node:crypto';
class Usuarios {
  constructor() {}
  adicionar(usuario) {
    const uuid = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO usuarios (uuid, nome, email_usuario, sync_status)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(
      uuid,
      usuario.nome,
      usuario.email_usuario,
      0
    );
    return info.lastInsertRowid;
  }
  async listarSincronizados() {
    const stmt = db.prepare(`SELECT * FROM usuarios WHERE sync_status = 1 AND excluido_em IS NULL`);
    return stmt.all();
  }
  async cadastrarLocalmente(usuarioRemoto){
    const uuid = crypto.randomUUID();
        const stmt = db.prepare(`
            INSERT INTO usuarios (uuid, nome_usuario, email_usuario, tipo_usuario, sync_status)
            VALUES (?, ?, ?, ?, 1)
        `);
        stmt.run(uuid, usuarioRemoto.nome_usuario, usuarioRemoto.email_usuario, usuarioRemoto.tipo_usuario);
    
  }
  async listar() {
    const stmt = db.prepare(`SELECT * FROM usuarios WHERE excluido_em IS NULL`);
    return stmt.all();
  }
  async buscarPorUUID(uuid){
    console.log(uuid);
    const stmt = db.prepare(`SELECT * FROM usuarios WHERE uuid = ? AND excluido_em IS NULL`);
    return stmt.get(uuid);
  }
  async atualizar(usuarioAtualizado){
    console.log('atualizar no model', usuarioAtualizado);
    const stmt = db.prepare(`UPDATE usuarios 
       SET nome = ?,
       email_usuario = ?,
       atualizado_em = CURRENT_TIMESTAMP,
       sync_status = 0 
       WHERE uuid = ?`
      );
    const info = stmt.run(
      usuarioAtualizado.nome,
      usuarioAtualizado.email_usuario,
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
}
export default Usuarios;