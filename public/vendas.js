class Venda {
    constructor() {
        this.itens = [];
        this.total = 0;
        this.formaPagamento = null;
        this.valorPago = 0;
    }

    async adicionarItem(produto, quantidade) {
        try {
            const response = await fetch(`/api/produtos/${produto.id}/estoque`);
            const estoque = await response.json();
            
            if (!response.ok) {
                throw new Error('Erro ao verificar estoque');
            }

            if (estoque.quantidade < quantidade) {
                throw new Error(`Estoque insuficiente. Disponível: ${estoque.quantidade}`);
            }

            this.itens.push({
                produto,
                quantidade,
                subtotal: produto.preco * quantidade
            });
            this.calcularTotal();

        } catch (error) {
            throw error;
        }
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