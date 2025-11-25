class Usuarios {
  constructor() {
    this.Usuarios = [
      {"id": 1,"nome": "jose", "idade": 26},
      {"id": 2,"nome": "maria", "idade": 35},
      {"id": 3,"nome": "xssss", "idade": 15},
    ];
  }
  adicionar(usuario) {
    this.Usuarios.push(usuario);
  }
  async listar() {
    return this.Usuarios;
  }
  async buscarPorId(id){
    return this.Usuarios.find(usuario => usuario.id === Number(id))
  }
  async atualizar(usuarioAtualizado){
    const index = this.Usuarios.indexOf(usuarioAtualizado);
    this.Usuarios[index] = {...this.Usuarios[index], ...usuarioAtualizado} 
  }

  remover(usuario) {
    const index = this.Usuarios.indexOf(usuario);
    if (index !== -1) {
      this.Usuarios.splice(index, 1);
    }
  }
}
export default Usuarios;