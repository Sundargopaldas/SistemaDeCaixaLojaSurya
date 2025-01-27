class Venda {
    constructor() {
        this.itens = [];
        this.total = 0;
        this.formaPagamento = null;
        this.valorPago = 0;
    }

    async adicionarItem(produto, quantidade) {
        this.itens.push({
            produto,
            quantidade,
            subtotal: produto.preco * quantidade
        });
        this.calcularTotal();
    }

    calcularTotal() {
        this.total = this.itens.reduce((sum, item) => sum + item.subtotal, 0);
    }

    definirPagamento(forma, valor) {
        this.formaPagamento = forma;
        this.valorPago = valor;
    }

    calcularTroco() {
        if (this.valorPago < this.total) {
            throw new Error('Valor pago insuficiente');
        }
        return this.valorPago - this.total;
    }
}

class Caixa {
    constructor() {
        this.saldoInicial = 0;
        this.saldoAtual = 0;
        this.aberto = false;
        this.vendasDoDia = [];
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

module.exports = { Venda, Caixa };