let itensVenda = [];
let totalVenda = 0;

function adicionarProduto() {
   const busca = document.getElementById('produto-busca').value;
   const quantidade = document.getElementById('quantidade').value;
   
   fetch(`/api/produtos/busca?termo=${busca}`)
       .then(response => response.json())
       .then(produtos => {
           console.log('Produtos encontrados:', produtos);
           if (produtos.length > 0) {
               const produto = produtos[0];
               itensVenda.push({
                   produto,
                   quantidade: parseInt(quantidade),
                   subtotal: produto.preco * quantidade
               });
               atualizarTelaVenda();
           }
       });
}

function atualizarTelaVenda() {
   const container = document.getElementById('itens-venda');
   container.innerHTML = '';
   totalVenda = 0;

   itensVenda.forEach((item, index) => {
       totalVenda += item.subtotal;
       container.innerHTML += `
           <div class="item-venda">
               <span>${item.produto.nome}</span>
               <span>${item.quantidade}</span>
               <span>R$ ${item.produto.preco}</span>
               <span>R$ ${item.subtotal}</span>
               <button onclick="removerItem(${index})">X</button>
           </div>
       `;
   });

   document.getElementById('total-venda').textContent = totalVenda.toFixed(2);
   calcularTroco();
}

function calcularTroco() {
   const valorPago = parseFloat(document.getElementById('valor-pago').value) || 0;
   const troco = valorPago - totalVenda;
   document.getElementById('troco').textContent = Math.max(0, troco).toFixed(2);
}

// ... resto do código permanece igual ...

function finalizarVenda() {
   const formaPagamento = document.getElementById('forma-pagamento').value;
   const valorPago = parseFloat(document.getElementById('valor-pago').value);

   const venda = {
       itens: itensVenda.map(item => ({
           produtoId: item.produto.id,
           quantidade: item.quantidade
       })),
       formaPagamento,
       valorPago
   };

   fetch('/api/vendas', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify(venda)
   })
   .then(response => response.json())
   .then(result => {
       if (result.message) {
           // Atualiza o troco na tela com o valor retornado do servidor
           document.getElementById('troco').textContent = result.troco.toFixed(2);
           
           // Mostra botão de confirmação de troco
           const confirmarTrocoBtn = document.createElement('button');
           confirmarTrocoBtn.textContent = 'Confirmar Entrega do Troco';
           confirmarTrocoBtn.className = 'btn-confirmar-troco';
           confirmarTrocoBtn.onclick = () => {
               alert('Venda finalizada com sucesso!');
               limparVenda();
           };
           
           // Adiciona o botão após o elemento que mostra o troco
           const trocoElement = document.getElementById('troco');
           trocoElement.parentNode.insertBefore(confirmarTrocoBtn, trocoElement.nextSibling);
       }
   })
   .catch(error => {
       console.error('Erro detalhado:', error);
       console.error('Status:', error.status);
       alert('Erro ao finalizar venda: ' + error.message);
   });
}

function limparVenda() {
   itensVenda = [];
   totalVenda = 0;
   document.getElementById('produto-busca').value = '';
   document.getElementById('quantidade').value = '1';
   document.getElementById('valor-pago').value = '';
   
   // Remove o botão de confirmar troco se ele existir
   const btnConfirmarTroco = document.querySelector('.btn-confirmar-troco');
   if (btnConfirmarTroco) {
       btnConfirmarTroco.remove();
   }
   
   atualizarTelaVenda();
}
function removerItem(index) {
   itensVenda.splice(index, 1);
   atualizarTelaVenda();
}