import db from '../database/index.js';
import { randomUUID } from 'node:crypto'; 

class Usuarios {
  constructor() {}
    
  getDataAtual() {
    return new Date().toISOString();
  }
  adicionar(usuario) {
    const stmt = db.prepare(`
      INSERT INTO usuarios (uuid, nome, idade, sync_status, atualizado_em) 
      VALUES (?, ?, ?, 0, ?)
    `);
    const uuid = usuario.uuid || randomUUID();
    const dataAtual = this.getDataAtual();
    const info = stmt.run(uuid, usuario.nome, usuario.idade, dataAtual);
    return { id: info.lastInsertRowid, uuid: uuid, ...usuario };
  }

  listar() {
    const stmt = db.prepare('SELECT * FROM usuarios WHERE excluido_em IS NULL');
    return stmt.all();
  }

  buscarPorId(id) {
    const stmt = db.prepare('SELECT * FROM usuarios WHERE id = ? AND excluido_em IS NULL');
    return stmt.get(id);
  }

  atualizar(usuario) {
    const stmt = db.prepare(`
      UPDATE usuarios 
      SET nome = ?, idade = ?, sync_status = 0, atualizado_em = ?
      WHERE id = ?
    `);
    const dataAtual = this.getDataAtual();
    const info = stmt.run(usuario.nome, usuario.idade, dataAtual, usuario.id);
    return info.changes > 0;
  }

  remover(id) {
    const stmt = db.prepare(`
      UPDATE usuarios 
      SET excluido_em = ?, sync_status = 0, atualizado_em = ?
      WHERE id = ?
    `);
    const dataAtual = this.getDataAtual();
    const info = stmt.run(dataAtual, dataAtual, id);
    return info.changes > 0;
  }
}

export default Usuarios;