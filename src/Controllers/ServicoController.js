import Servicos from '../Models/Servicos.js';
import ServicosView from '../Views/ServicosView.js';
class ServicoController{
    constructor(){
        this.ServicoModel = new Servicos();
        this.ServicosView = new ServicosView(this.ServicoModel);
    }
    listar(){
        return this.ServicosView.renderizar();
    }

}
export default ServicoController;