import bcrypt from 'bcrypt';
import db from '../db/Database.js'; 

class User {
  constructor(id, username, password, role) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.role = role;
  }

  static async buscarPorUsername(username) {
    const row = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (row) {
      return row;
    }
    return null;
  }

  static async validarSenha(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async gerarHashSenha(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  static async criar(username, password, role) {
    const hashedPassword = await this.gerarHashSenha(password);
    try {
      const result = await db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );
      return { id: result.lastID, username, role };
    } catch (err) {
      throw err;
    }
  }

  static async buscarPorId(id) {
    const row = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (row) {
      const { password, ...userWithoutPassword } = row;
      return userWithoutPassword;
    }
    return null;
  }
}

const nomeTeste = `teste_${Date.now()}`; 

User.criar(nomeTeste, "minhasenha123", "admin")
  .then((novoUsuario) => {
    console.log("Novo usuário criado com sucesso:", novoUsuario);
  })
  .catch((err) => {
    console.error("Erro ao criar usuário:", err);
  });

export default User;