class ServicosView{
    constructor(){
    }
    renderizar(Servicos){
        let container ='<div class="container">';
        Servicos.forEach(servico => {
            container += `<div> ${servico.nome} - ${servico.preço} </div><br/>`
        });
        container += '</div>';
        return container;
    }
}
export default ServicosView;