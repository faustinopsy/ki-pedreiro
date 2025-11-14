import Servico from '../Models/Servico.js';
class ServicoView {
    constructor() {
        this.servicoModel = new Servico();
    }
    renderizar(){
        const servicos = this.servicoModel.listar();
        let html = '<ul class="container">';
        servicos.forEach(servico => {
            html += `<li>${servico.nome}</li>`;
        });
        html += '</ul>';
        return html;
    }
}
export default ServicoView;