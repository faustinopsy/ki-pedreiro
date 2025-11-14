class Usuario {
    constructor() {
        this.usuarios = [
            { id: 1, nome: 'jose da silva', idade: 20 },
            { id: 2, nome: 'maria da silva', idade: 30 },
            { id: 3, nome: 'Mjoao', idade: 50 },
        ];
    }
    listar() {
        return this.usuarios;
    }
}
export default Usuario;