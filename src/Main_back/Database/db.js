import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';
//                        no explore %appdata%
const dbPath = path.join(app.getPath('userData'), 'kipedreiro.db');
const db = new Database(dbPath, { verbose: console.log });

export function initDatabase() {
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT, 
      nome_usuario TEXT NOT NULL,
      email_usuario TEXT NOT NULL,
      tipo_usuario TEXT NOT NULL,
      sync_status INTEGER DEFAULT 0, -- 0 = Pendente, 1 = Sincronizado
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME,
      excluido_em DATETIME -- Se estiver preenchido, o registro foi "deletado"
    );

    CREATE TABLE IF NOT EXISTS servicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_servico TEXT,
      descricao_servico TEXT,
      foto_servico TEXT,
      caminho_imagem TEXT,
      image_base64 TEXT,
      sync_status INTEGER DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME,
      excluido_em DATETIME
    );
  `);

  console.log('Banco de dados inicializado em:', dbPath);
}

export default db;