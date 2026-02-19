const Database = require('better-sqlite3');
import { app } from 'electron';
import path from 'node:path';

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
      sync_status INTEGER DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME,
      excluido_em DATETIME
    );

    CREATE TABLE IF NOT EXISTS servicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_servico TEXT,
      descricao_servico TEXT,
      foto_servico TEXT,
      caminho_imagem TEXT,
      image_base64 TEXT,
      tipo_servico TEXT DEFAULT 'vitrine',
      sync_status INTEGER DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME,
      excluido_em DATETIME
    );

    CREATE TABLE IF NOT EXISTS orcamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      cliente_uuid TEXT NOT NULL,
      status TEXT DEFAULT 'rascunho',
      valor_total REAL DEFAULT 0,
      observacoes TEXT,
      sync_status INTEGER DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME,
      excluido_em DATETIME
    );

    CREATE TABLE IF NOT EXISTS orcamento_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orcamento_id INTEGER NOT NULL,
      servico_id INTEGER NOT NULL,
      quantidade INTEGER DEFAULT 1,
      valor_unitario REAL DEFAULT 0,
      valor_total REAL DEFAULT 0
    );
  `);

  // Migração segura para bancos já existentes sem tipo_servico
  try {
    db.exec(`ALTER TABLE servicos ADD COLUMN tipo_servico TEXT DEFAULT 'vitrine';`);
    console.log('[DB] Coluna tipo_servico adicionada em servicos.');
  } catch (_) {
    // Coluna já existe — ignorar
  }

  console.log('Banco de dados inicializado em:', dbPath);
}

export default db;