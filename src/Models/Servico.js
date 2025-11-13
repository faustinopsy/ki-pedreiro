class Servico {
    constructor() {
        this.servicos = [
            { id: 1, nome: 'Desenvolvimento Web', preco: 1500 },
            { id: 2, nome: 'Design Gráfico', preco: 800 },
            { id: 3, nome: 'Marketing Digital', preco: 1200 },
        ];
    }
    
    listar() {
        return this.servicos;
    }
    buscarPorId(id) {
        return this.servicos.find(servico => servico.id === id);
    }
    adicionar(servico) {
        this.servicos.push(servico);
    }
    remover(id) {
        this.servicos = this.servicos.filter(servico => servico.id !== id);
    }

}
export default Servico;