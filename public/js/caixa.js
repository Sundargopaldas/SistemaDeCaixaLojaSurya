// caixa.js

// Removida a importação ES6, usando as funções globais disponíveis através do objeto window
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function createAuthHeaders() {
    // Usar a função global se disponível, caso contrário usa a implementação local
    if (window.getAuthHeadersGlobal) {
        return window.getAuthHeadersGlobal();
    }
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const authToken = getAuthToken();
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
}

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
    total: 0,
    formaPagamento: 'dinheiro'
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
        const response = await fetch(`/api/produtos/busca?termo=${produtoBusca}`, {
            headers: createAuthHeaders()
        });
        const produtos = await response.json();

        if (produtos.length === 0) {
            alert('Produto não encontrado');
            return;
        }

        const produto = produtos[0];
        
        // Verificar se há estoque suficiente
        if (quantidade > produto.quantidade) {
            alert(`Estoque insuficiente para ${produto.nome}. Disponível: ${produto.quantidade} unidades.`);
            return;
        }
        
        const totalItem = produto.preco * quantidade;

        // Adiciona ao array de itens (guardando informação de estoque)
        vendaAtual.itens.push({
            produtoId: produto.id,
            nome: produto.nome,
            quantidade: quantidade,
            estoque: produto.quantidade, // Guarda o estoque atual
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

// Função para atualizar os campos conforme a forma de pagamento selecionada
function atualizarFormaPagamento() {
    const formaPagamentoSelect = document.getElementById('forma-pagamento');
    if (!formaPagamentoSelect) return; // Guard against null element
    
    const formaPagamento = formaPagamentoSelect.value;
    vendaAtual.formaPagamento = formaPagamento;
    
    // Oculta todos os campos específicos
    const camposDinheiro = document.getElementById('campos-dinheiro');
    const camposCartao = document.getElementById('campos-cartao');
    const camposPix = document.getElementById('campos-pix');
    
    if (camposDinheiro) camposDinheiro.style.display = 'none';
    if (camposCartao) camposCartao.style.display = 'none';
    if (camposPix) camposPix.style.display = 'none';
    
    // Mostra apenas os campos da forma de pagamento selecionada
    const campoSelecionado = document.getElementById(`campos-${formaPagamento}`);
    if (campoSelecionado) campoSelecionado.style.display = 'block';
    
    // Configurações específicas para cartão
    if (formaPagamento === 'cartao') {
        const tipoCartao = document.getElementById('tipo-cartao');
        if (tipoCartao) {
            tipoCartao.onchange = atualizarTipoCartao;
            atualizarTipoCartao(); // Inicializa com o valor atual
        }
    }
}

// Função para atualizar os campos conforme o tipo de cartão
function atualizarTipoCartao() {
    const tipoCartao = document.getElementById('tipo-cartao');
    if (!tipoCartao) return; // Guard against null element
    
    const camposCredito = document.getElementById('campos-credito');
    if (!camposCredito) return; // Guard against null element
    
    if (tipoCartao.value === 'credito') {
        camposCredito.style.display = 'block';
    } else {
        camposCredito.style.display = 'none';
    }
}

// Atualiza o cálculo do troco quando o valor pago é alterado
document.addEventListener('DOMContentLoaded', function() {
    const valorPagoInput = document.getElementById('valor-pago');
    if (valorPagoInput) {
        valorPagoInput.addEventListener('input', calcularTroco);
    }
    
    // Inicializa a forma de pagamento quando o DOM estiver carregado
    atualizarFormaPagamento();
    
    // Setup listeners for other form elements
    const formaPagamentoSelect = document.getElementById('forma-pagamento');
    if (formaPagamentoSelect) {
        formaPagamentoSelect.addEventListener('change', atualizarFormaPagamento);
    }
});

function calcularTroco() {
    const valorPago = parseFloat(document.getElementById('valor-pago').value || 0);
    const troco = valorPago - vendaAtual.total;
    document.getElementById('troco').textContent = troco >= 0 ? troco.toFixed(2) : '0.00';
}

let vendaFinalizada = false;

// Versão simplificada que não requer chamada de API
async function verificarEstoqueTotal() {
    const quantidadesPorProduto = {};
    
    // Somamos as quantidades de cada produto (caso tenha o mesmo produto mais de uma vez)
    for (const item of vendaAtual.itens) {
        if (!quantidadesPorProduto[item.produtoId]) {
            quantidadesPorProduto[item.produtoId] = {
                nome: item.nome,
                quantidade: 0,
                estoque: item.estoque
            };
        }
        quantidadesPorProduto[item.produtoId].quantidade += item.quantidade;
    }
    
    // Verificamos se algum produto excede o estoque
    for (const produtoId in quantidadesPorProduto) {
        const info = quantidadesPorProduto[produtoId];
        if (info.quantidade > info.estoque) {
            alert(`Estoque insuficiente para ${info.nome}. Disponível: ${info.estoque} unidades.`);
            return false;
        }
    }
    
    return true;
}

async function finalizarOuConfirmar() {
    if (vendaFinalizada) {
        limparVenda();
        return;
    }

    try {
        // Verificar se há itens de venda no caso normal
        const itensVenda = document.getElementById('itens-venda');
        if (!itensVenda || !itensVenda.children.length) {
            // Aviso amigável para o usuário
            alert('Por favor, adicione produtos antes de finalizar a venda');
            return;
        }

        // Verificar forma de pagamento
        const formaPagamento = document.getElementById('forma-pagamento').value;
        let pagamentoValido = true;
        let dadosPagamento = { forma: formaPagamento };

        // Validações específicas por forma de pagamento
        if (formaPagamento === 'dinheiro') {
            const valorPago = parseFloat(document.getElementById('valor-pago').value);
            if (!valorPago || valorPago < vendaAtual.total) {
                alert('Informe um valor pago válido e suficiente');
                pagamentoValido = false;
            } else {
                dadosPagamento.valorPago = valorPago;
                dadosPagamento.troco = valorPago - vendaAtual.total;
            }
        } else if (formaPagamento === 'cartao') {
            const tipoCartao = document.getElementById('tipo-cartao').value;
            dadosPagamento.tipoCartao = tipoCartao;
            
            if (tipoCartao === 'credito') {
                const parcelas = document.getElementById('parcelas').value;
                dadosPagamento.parcelas = parcelas;
            }
        } else if (formaPagamento === 'pix') {
            const pixConfirmado = document.getElementById('pix-confirmado').checked;
            if (!pixConfirmado) {
                alert('Confirme o recebimento do PIX antes de finalizar');
                pagamentoValido = false;
            }
        }

        if (!pagamentoValido) {
            return;
        }

        // Verificar estoque antes de finalizar
        const estoqueOk = await verificarEstoqueTotal();
        if (!estoqueOk) {
            return;
        }

        // Verificar se vendaAtual tem itens e configurar corretamente
        if (!vendaAtual.itens || !Array.isArray(vendaAtual.itens)) {
            console.error("Erro: vendaAtual.itens não é um array válido:", vendaAtual.itens);
            vendaAtual.itens = [];
        }

        // Preparar dados da venda com validação adicional
        const venda = {
            itens: vendaAtual.itens.map(item => ({
                produto_id: item.produtoId,
                produtoId: item.produtoId, // Incluir ambos para compatibilidade
                quantidade: item.quantidade,
                preco: item.preco,
                preco_unitario: item.preco, // Incluir ambos para compatibilidade
                subtotal: item.subtotal
            })),
            formaPagamento: formaPagamento,
            total: vendaAtual.total,
            ...dadosPagamento
        };

        console.log("Enviando dados da venda:", JSON.stringify(venda, null, 2));

        // Enviar para o servidor
        try {
            const response = await fetch('/api/vendas', {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(venda)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Resposta de erro:", response.status, errorData);
                throw new Error(`Erro ao finalizar venda: ${response.status} ${errorData.error || ''}`);
            }

            const result = await response.json();
            console.log("Resposta de sucesso:", result);
            
            const btnFinalizar = document.getElementById('btn-finalizar');
            btnFinalizar.textContent = 'Nova Venda';
            vendaFinalizada = true;
            
            // Mostrar confirmação com informações da venda
            let mensagem = `Venda finalizada com sucesso!\n\n`;
            mensagem += `Total: R$ ${vendaAtual.total.toFixed(2)}\n`;
            mensagem += `Forma de Pagamento: ${formaPagamento.charAt(0).toUpperCase() + formaPagamento.slice(1)}\n`;
            
            if (formaPagamento === 'dinheiro') {
                mensagem += `Valor Pago: R$ ${dadosPagamento.valorPago.toFixed(2)}\n`;
                mensagem += `Troco: R$ ${dadosPagamento.troco.toFixed(2)}\n`;
            } else if (formaPagamento === 'cartao') {
                mensagem += `Tipo: ${dadosPagamento.tipoCartao === 'credito' ? 'Crédito' : 'Débito'}\n`;
                if (dadosPagamento.tipoCartao === 'credito' && dadosPagamento.parcelas > 1) {
                    mensagem += `Parcelas: ${dadosPagamento.parcelas}x\n`;
                }
            }
            
            alert(mensagem);
            
        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            alert('Erro ao finalizar venda: ' + error.message);
        }
    } catch (generalError) {
        console.error('Erro geral ao processar venda:', generalError);
        alert('Erro ao processar venda: ' + generalError.message);
    }
}

function limparVenda() {
    document.getElementById('produto-busca').value = '';
    document.getElementById('quantidade').value = '1';
    document.getElementById('itens-venda').innerHTML = '';
    document.getElementById('total-venda').textContent = '0.00';
    
    // Limpa campos específicos de cada forma de pagamento
    if (document.getElementById('valor-pago')) {
        document.getElementById('valor-pago').value = '';
    }
    document.getElementById('troco').textContent = '0.00';
    
    if (document.getElementById('pix-confirmado')) {
        document.getElementById('pix-confirmado').checked = false;
    }
    
    // Resetar o botão
    const botao = document.getElementById('btn-finalizar');
    botao.textContent = 'Finalizar Venda';
    botao.disabled = false;
    vendaFinalizada = false;
}

// Inicializa a forma de pagamento quando a página carrega
window.onload = function() {
    // Inicializa vendaAtual como objeto vazio se não existir
    if (!vendaAtual) {
        vendaAtual = {
            itens: [],
            total: 0,
            formaPagamento: 'dinheiro'
        };
    }
    
    // Configura eventos para o campo valor-pago
    const valorPagoInput = document.getElementById('valor-pago');
    if (valorPagoInput) {
        valorPagoInput.addEventListener('input', calcularTroco);
    }
    
    atualizarFormaPagamento();
};