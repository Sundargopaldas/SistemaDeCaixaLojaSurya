// caixa.js
class Caixa {
    constructor() {
        this.saldoInicial = 0;
        this.saldoAtual = 0;
        this.aberto = false;
        this.vendasDoDia = [];
        this.vendaAtual = {
            itens: [],
            total: 0
        };
    }

    abrirCaixa(saldoInicial) {
        this.saldoInicial = saldoInicial;
        this.saldoAtual = saldoInicial;
        this.aberto = true;
        this.vendasDoDia = [];
    }

    fecharCaixa() {
        const fechamento = {
            saldoInicial: this.saldoInicial,
            saldoFinal: this.saldoAtual,
            totalVendas: this.vendasDoDia.length,
            vendas: this.vendasDoDia
        };
        this.aberto = false;
        return fechamento;
    }
}

// Variável global para a venda atual
let vendaAtual = {
    itens: [],
    total: 0
};

// Funções da interface
async function adicionarProduto() {
    const produtoBusca = document.getElementById('produto-busca').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);

    if (!produtoBusca || !quantidade) {
        alert('Preencha o nome do produto e quantidade');
        return;
    }

    try {
        const response = await fetch(`/api/produtos/busca?termo=${produtoBusca}`);
        const produtos = await response.json();

        if (produtos.length === 0) {
            alert('Produto não encontrado');
            return;
        }

        const produto = produtos[0];
        const totalItem = produto.preco * quantidade;

        // Adiciona ao array de itens
        vendaAtual.itens.push({
            produtoId: produto.id,
            nome: produto.nome,
            quantidade: quantidade,
            preco: produto.preco,
            subtotal: totalItem
        });

        // Atualiza o total
        vendaAtual.total = vendaAtual.itens.reduce((sum, item) => sum + item.subtotal, 0);

        // Atualiza a interface
        document.getElementById('itens-venda').innerHTML += `
            <div class="item-venda">
                <span>${produto.nome}</span>
                <span>${quantidade}x</span>
                <span>R$ ${totalItem.toFixed(2)}</span>
            </div>
        `;

        // Atualiza o total na tela
        document.getElementById('total-venda').textContent = vendaAtual.total.toFixed(2);

        document.getElementById('produto-busca').value = '';
        document.getElementById('quantidade').value = '1';

    } catch (error) {
        alert('Erro ao adicionar produto: ' + error.message);
    }
}

let vendaFinalizada = false;

function finalizarOuConfirmar() {
    const botao = document.getElementById('btn-finalizar');
    
    if (!vendaFinalizada) {
        // Primeira fase: Finalizar Venda
        const formaPagamento = document.getElementById('forma-pagamento').value;
        const valorPago = parseFloat(document.getElementById('valor-pago').value || 0);

        if (valorPago < vendaAtual.total) {
            alert('Valor pago é menor que o total da venda!');
            return;
        }

        botao.disabled = true; // Previne duplo clique

        fetch('/api/vendas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                itens: vendaAtual.itens,
                formaPagamento: formaPagamento,
                valorPago: valorPago
            })
        })
        .then(response => response.json())
        .then(data => {
            const troco = valorPago - vendaAtual.total;
            document.getElementById('troco').textContent = troco.toFixed(2);
            
            if (troco > 0) {
                vendaFinalizada = true;
                botao.textContent = 'Confirmar Troco';
                botao.disabled = false;
            } else {
                limparVenda();
            }
        })
        .catch(error => {
            alert('Erro ao finalizar venda: ' + error.message);
            botao.disabled = false;
        });
    } else {
        // Segunda fase: Confirmar Troco
        limparVenda();
        vendaFinalizada = false;
        botao.textContent = 'Finalizar Venda';
        alert("Venda realizada com sucesso!");
    }
}

function limparVenda() {
    vendaAtual = {
        itens: [],
        total: 0
    };
    
    document.getElementById('produto-busca').value = '';
    document.getElementById('quantidade').value = '1';
    document.getElementById('itens-venda').innerHTML = '';
    document.getElementById('total-venda').textContent = '0.00';
    document.getElementById('valor-pago').value = '';
    document.getElementById('troco').textContent = '0.00';
    
    // Resetar o botão
    const botao = document.getElementById('btn-finalizar');
    botao.textContent = 'Finalizar Venda';
    botao.disabled = false;
    vendaFinalizada = false;
}