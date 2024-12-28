// main.js
document.getElementById('produtoForm').addEventListener('submit', async (e) => {
   e.preventDefault();
   
   const produto = {
       nome: e.target.nome.value,
       preco: parseFloat(e.target.preco.value),
       estoque: parseInt(e.target.estoque.value),
       categoria_id: parseInt(e.target.categoria_id.value)
   };

   try {
       const response = await fetch('/api/produtos', {
           method: 'POST',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify(produto)
       });
       if(response.ok) {
           alert('Produto cadastrado!');
           window.location.href = '/produtolista.html';
       }
   } catch (error) {
       console.error(error);
   }
});

async function listarProdutos() {
   const response = await fetch('/api/produtos');
   const produtos = await response.json();
   
   const lista = document.getElementById('listaProdutos');
   lista.innerHTML = produtos.map(p => `
       <div class="produto-item">
           <strong>${p.categoria}</strong><br>
           ${p.nome} - R$ ${Number(p.preco).toFixed(2)} - Estoque: ${p.estoque}
       </div>
   `).join('');
}

listarProdutos();