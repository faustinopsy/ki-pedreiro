class Usuarios {
  constructor() {
    this.Usuarios = [
      {"id":1, "nome": "jose", "idade": 26},
      {"id":2, "nome": "maria", "idade": 35},
    ];
  }
  adicionar(usuario) {
    this.Usuarios.push(usuario);
  }
  listar() {
    return this.Usuarios;
  }
  buscarPorId(id) {
    return this.Usuarios.find(u => u.id === Number(id));
  }
  atualizar(usuarioAtualizado) {
    const index = this.Usuarios.findIndex(u => u.id === Number(usuarioAtualizado.id));
    if (index !== -1) {
      this.Usuarios[index] = { ...this.Usuarios[index], ...usuarioAtualizado };
      return true;
    }
    return false;
  }
  remover(usuario) {
    const index = this.Usuarios.indexOf(usuario);
    if (index !== -1) {
      this.Usuarios.splice(index, 1);
    }
  }
}
export default Usuarios;