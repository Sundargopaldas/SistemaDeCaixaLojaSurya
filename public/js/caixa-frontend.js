
// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
// Variável para armazenar a venda atual
let vendaAtual = {
    itens: [],
    total: 0
};

// Função chamada pelo botão
async function adicionarProduto() {
    const produtoBusca = document.getElementById('produto-busca').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);

    if (!produtoBusca || !quantidade) {
        alert('Preencha o nome do produto e quantidade');
        return;
    }

    try {
        // Busca o produto no backend
        const response = await fetch(`/api/produtos/busca?termo=${produtoBusca}`, { headers: getAuthHeaders() });
        const produtos = await response.json();

        if (produtos.length === 0) {
            alert('Produto não encontrado');
            return;
        }

        const produto = produtos[0]; // Pega o primeiro produto encontrado

        // Adiciona à lista de itens
        vendaAtual.itens.push({
            produtoId: produto.id,
            nome: produto.nome,
            quantidade: quantidade,
            preco: produto.preco,
            subtotal: produto.preco * quantidade
        });

        // Atualiza o total
        vendaAtual.total = vendaAtual.itens.reduce((sum, item) => sum + item.subtotal, 0);

        // Atualiza a interface
        atualizarTelaVenda();
        
        // Limpa os campos
        document.getElementById('produto-busca').value = '';
        document.getElementById('quantidade').value = '1';

    } catch (error) {
        alert('Erro ao adicionar produto: ' + error.message);
    }
}

function atualizarTelaVenda() {
    const container = document.getElementById('itens-venda');
    container.innerHTML = '';

    vendaAtual.itens.forEach(item => {
        container.innerHTML += `
            <div class="item-venda">
                <span>${item.nome}</span>
                <span>${item.quantidade}x</span>
                <span>R$ ${item.subtotal.toFixed(2)}</span>
            </div>
        `;
    });

    document.getElementById('total-venda').textContent = vendaAtual.total.toFixed(2);
}

function finalizarVenda() {
    const formaPagamento = document.getElementById('forma-pagamento').value;
    const valorPago = parseFloat(document.getElementById('valor-pago').value || 0);

    if (valorPago < vendaAtual.total) {
        alert('Valor pago é menor que o total da venda!');
        return;
    }

    fetch('/api/vendas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            itens: vendaAtual.itens,
            formaPagamento: formaPagamento,
            valorPago: valorPago
        }, { headers: getAuthHeaders() })
    })
    .then(response => response.json())
    .then(data => {
        const troco = valorPago - vendaAtual.total;
        document.getElementById('troco').textContent = troco.toFixed(2);
        
        if (troco > 0) {
            document.getElementById('confirmar-troco').style.display = 'block';
        } else {
            limparVenda();
        }
    })
    .catch(error => {
        alert('Erro ao finalizar venda: ' + error.message);
    });
}

function confirmarTroco() {
    limparVenda();
    document.getElementById('confirmar-troco').style.display = 'none';
}

function limparVenda() {
    vendaAtual = {
        itens: [],
        total: 0
    };
    
    document.getElementById('produto-busca').value = '';
    document.getElementById('quantidade').value = '1';
    document.getElementById('valor-pago').value = '';
    document.getElementById('troco').textContent = '0.00';
    atualizarTelaVenda();
}