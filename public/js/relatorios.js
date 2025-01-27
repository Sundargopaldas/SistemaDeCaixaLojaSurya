async function filtrarVendas() {
    try {
        const mes = document.getElementById('mesFilter').value;
        const ano = document.getElementById('anoFilter').value;
        const response = await fetch(`/api/relatorios/produtos-mais-vendidos?mes=${mes}&ano=${ano}`);
        const { data } = await response.json();
        
        const tbody = document.getElementById('produtosMaisVendidosTable');
        tbody.innerHTML = '';

        let totalValor = 0;
        let totalQuantidade = 0;

        data.forEach(produto => {
            totalValor += parseFloat(produto.valor_total_vendas);
            totalQuantidade += parseInt(produto.total_vendido);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.total_vendido}</td>
                <td>R$ ${parseFloat(produto.valor_total_vendas).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });

        // Adiciona linha de total
        const trTotal = document.createElement('tr');
        trTotal.innerHTML = `
            <td><strong>Total</strong></td>
            <td><strong>${totalQuantidade}</strong></td>
            <td><strong>R$ ${totalValor.toFixed(2)}</strong></td>
        `;
        tbody.appendChild(trTotal);
    } catch (error) {
        console.error('Erro:', error);
    }
}