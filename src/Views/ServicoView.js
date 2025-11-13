import Servico from '../Models/Servico.js';
class ServicoView {
    constructor() {
        this.servicoModel = new Servico();
    }
    listarServicos() {
        return this.servicoModel.listar();
    }
    mostrarDetalhes(id) {
        return this.servicoModel.buscarPorId(id);
    }
    renderizar(){
        const servicos = this.listarServicos();
        let html = '<ul>';
        servicos.forEach(servico => {
            html += `<li>${servico.nome}</li>`;
        });
        html += '</ul>';
        return html;
    }
}
export default ServicoView;