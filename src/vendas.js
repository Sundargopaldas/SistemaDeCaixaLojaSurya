class Venda {
  constructor() {
    this.itens = [];
    this.total = 0;
    this.formaPagamento = null;
    this.valorPago = 0;
  }

  adicionarItem(produto, quantidade) {
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
    this.vendas = [];
    this.saldoInicial = 0;
    this.saldoAtual = 0;
  }

  abrirCaixa(saldoInicial) {
    this.saldoInicial = saldoInicial;
    this.saldoAtual = saldoInicial;
  }

  registrarVenda(venda) {
    this.vendas.push(venda);
    this.saldoAtual += venda.total;
  }

  fecharCaixa() {
    return {
      totalVendas: this.vendas.length,
      faturamento: this.vendas.reduce((sum, venda) => sum + venda.total, 0),
      saldoInicial: this.saldoInicial,
      saldoFinal: this.saldoAtual
    };
  }
}

module.exports = { Venda, Caixa };