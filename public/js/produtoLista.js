let todosProdutos = [];

async function carregarProdutos() {
    try {
        const response = await fetch('/api/produtos');
        todosProdutos = await response.json();
        atualizarListagem(todosProdutos);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

function atualizarListagem(produtos) {
    const lista = document.getElementById('listaProdutos');
    lista.innerHTML = produtos.length === 0 ? 
        '<div class="sem-produtos">Nenhum produto encontrado</div>' :
        produtos.map(p => `
            <div class="produto-item">
                <strong class="categoria">${p.categoria}</strong>
                <div class="nome">${p.nome}</div>
                <div class="preco">Preço: R$ ${Number(p.preco).toFixed(2)}</div>
                <div class="estoque">Estoque: ${p.quantidade}</div>
                <div class="acoes">
                    <button onclick="editarProduto(${p.id})">Editar</button>
                    <button onclick="excluirProduto(${p.id})" class="excluir">Excluir</button>
                </div>
            </div>
        `).join('');
}

document.getElementById('filtroCategoria').addEventListener('change', (e) => {
    const categoriaSelecionada = e.target.value;
    const produtosFiltrados = categoriaSelecionada ? 
        todosProdutos.filter(p => p.categoria === categoriaSelecionada) : 
        todosProdutos;
    atualizarListagem(produtosFiltrados);
});

document.addEventListener('DOMContentLoaded', carregarProdutos);

async function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
        const response = await fetch(`/api/produtos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            todosProdutos = todosProdutos.filter(p => p.id !== id);
            atualizarListagem(todosProdutos);
            alert('Produto excluído com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto');
    }
}
// Adicionar ao produtos-lista.js
function editarProduto(id) {
    const produto = todosProdutos.find(p => p.id === id);
    if (!produto) return;
    
    const form = document.getElementById('editForm');
    if (!form) return;

    form.nome.value = produto.nome || '';
    form.preco.value = produto.preco || '';
    form.quantidade.value = produto.quantidade || 0;
    form.categoria_id.value = produto.categoria_id || '';
    
    document.getElementById('editModal').style.display = 'block';
    form.onsubmit = async (e) => await salvarEdicao(e, id);
}

async function salvarEdicao(e, id) {
    e.preventDefault();
    const form = e.target;
    const produto = {
    nome: form.nome.value,
    preco: parseFloat(form.preco.value),
    quantidade: parseInt(form.quantidade.value),
    categoria_id: parseInt(form.categoria_id.value)
};

    try {
        const response = await fetch(`/api/produtos/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(produto)
        });
        if(response.ok) {
            closeModal();
            carregarProdutos();
        }
    } catch (error) {
        console.error(error);
    }
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}