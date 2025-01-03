// Inicializando a venda
let vendaAtual = new Venda();
let totalVenda = 0;

async function adicionarProduto() {
    const busca = document.getElementById('produto-busca').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    
    try {
        // Primeiro busca o produto
        const response = await fetch(`/api/produtos/busca?termo=${busca}`);
        const produtos = await response.json();
        
        if (produtos.length > 0) {
            const produto = produtos[0];
            
            // Verificar estoque antes de adicionar
            const estoqueResponse = await fetch(`/api/produtos/${produto.id}/estoque`);
            const estoqueData = await estoqueResponse.json();
            
            if (estoqueData.quantidade < quantidade) {
                alert(`Estoque insuficiente! Disponível: ${estoqueData.quantidade} unidades`);
                return;
            }
            
            await vendaAtual.adicionarItem(produto, quantidade);
            atualizarTelaVenda();
        } else {
            alert('Produto não encontrado');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert(error.message || 'Erro ao adicionar produto');
    }
}
function atualizarTelaVenda() {
    const container = document.getElementById('itens-venda');
    container.innerHTML = '';
    totalVenda = vendaAtual.total;

    vendaAtual.itens.forEach((item, index) => {
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

function removerItem(index) {
    vendaAtual.itens.splice(index, 1);
    vendaAtual.calcularTotal();
    atualizarTelaVenda();
}

async function finalizarVenda() {
    const formaPagamento = document.getElementById('forma-pagamento').value;
    const valorPago = parseFloat(document.getElementById('valor-pago').value);

    if (!valorPago || valorPago < totalVenda) {
        alert('Valor pago insuficiente!');
        return;
    }

    try {
        vendaAtual.definirPagamento(formaPagamento, valorPago);
        
        const vendaData = {
            itens: vendaAtual.itens.map(item => ({
                produtoId: item.produto.id,
                quantidade: item.quantidade,
                subtotal: item.subtotal
            })),
            formaPagamento: vendaAtual.formaPagamento,
            valorPago: vendaAtual.valorPago,
            total: vendaAtual.total
        };

        const response = await fetch('/api/vendas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vendaData)
        });

        const result = await response.json();

        if (result.success) {
            const troco = vendaAtual.calcularTroco();
            document.getElementById('troco').textContent = troco.toFixed(2);
            alert(`Venda finalizada com sucesso!\nTroco: R$ ${troco.toFixed(2)}`);
            limparVenda();
        } else {
            throw new Error(result.message || 'Erro ao finalizar venda');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert(error.message || 'Erro ao finalizar venda');
    }
}

function confirmarTroco() {
    document.getElementById('confirmar-troco').style.display = 'none';
}

function limparVenda() {
    vendaAtual = new Venda();
    totalVenda = 0;
    document.getElementById('produto-busca').value = '';
    document.getElementById('quantidade').value = '1';
    document.getElementById('valor-pago').value = '';
    atualizarTelaVenda();
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('valor-pago').addEventListener('input', calcularTroco);
});