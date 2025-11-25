import sqlite3 from 'sqlite3';
import path from 'path';

class Database {
  constructor() {
    this.ready = false;
    this.db = null;
    const dbPath = path.join(process.cwd(), 'pdv.db');
    console.log('Caminho do banco de dados:', dbPath);
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco:', err.message);
      } else {
        console.log('Conectado ao banco SQLite.');
        this.ready = true;
        this.init();
      }
    });
  }

  isReady() {
    return this.ready;
  }

  init() {
    console.log('Inicializando o banco de dados...');
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'funcionario'))
        )
      `, (err) => {
        if (err) {
          console.error('Erro ao criar tabela users:', err.message);
        } else {
          console.log('Tabela users criada ou já existe.');
          this.db.run(`
            INSERT OR IGNORE INTO users (username, password, role)
            VALUES 
              ('admin', 'admin123', 'admin'),
              ('funcionario', 'func123', 'funcionario')
          `, (err) => {
            if (err) {
              console.error('Erro ao inserir usuários:', err.message);
            } else {
              console.log('Usuários padrão inseridos ou já existem.');
            }
          });
        }
      });

      this.db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          price REAL NOT NULL,
          stock INTEGER NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error('Erro ao criar tabela products:', err.message);
        } else {
          console.log('Tabela products criada ou já existe.');
          this.db.run(`
            INSERT OR IGNORE INTO products (name, price, stock)
            VALUES 
              ('Produto A', 10.00, 100),
              ('Produto B', 20.00, 50)
          `, (err) => {
            if (err) {
              console.error('Erro ao inserir produtos:', err.message);
            } else {
              console.log('Produtos padrão inseridos ou já existem.');
            }
          });
        }
      });

      this.db.run(`
        CREATE TABLE IF NOT EXISTS sales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          total REAL NOT NULL,
          date TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('Erro ao criar tabela sales:', err.message);
        } else {
          console.log('Tabela sales criada ou já existe.');
        }
      });

      this.db.run(`
        CREATE TABLE IF NOT EXISTS sale_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sale_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          FOREIGN KEY (sale_id) REFERENCES sales(id),
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `, (err) => {
        if (err) {
          console.error('Erro ao criar tabela sale_items:', err.message);
        } else {
          console.log('Tabela sale_items criada ou já existe.');
        }
      });
    });
  }

  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) {
          console.error('Erro ao executar query:', query, err.message);
          reject(err);
        } else {
          console.log('Query executada com sucesso:', query);
          resolve(this);
        }
      });
    });
  }

  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          console.error('Erro ao obter dados:', query, err.message);
          reject(err);
        } else {
          console.log('Dados obtidos:', row);
          resolve(row);
        }
      });
    });
  }

  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Erro ao obter dados:', query, err.message);
          reject(err);
        } else {
          resolve(rows);
          console.log('Dados obtidos:', rows);
          
        }
      });
    });
  }
}

export default new Database();