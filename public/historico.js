// historico.js

// Função para mostrar vendas do dia
function mostrarVendasDia() {
    document.getElementById('vendas-dia').style.display = 'block';
    document.getElementById('vendas-mes').style.display = 'none';
    carregarVendasDia();
}

// Função para mostrar vendas do mês
function mostrarVendasMes() {
    document.getElementById('vendas-dia').style.display = 'none';
    document.getElementById('vendas-mes').style.display = 'block';
    carregarVendasMes();
}

// Carregar vendas do dia
function carregarVendasDia() {
    const tbody = document.getElementById('vendas-dia-tbody');
    tbody.innerHTML = ''; // Limpa a tabela

    fetch('/api/vendas/dia')
        .then(response => response.json())
        .then(vendas => {
            vendas.forEach(venda => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(venda.data).toLocaleTimeString()}</td>
                    <td>${formatarProdutos(venda.itens)}</td>
                    <td>${venda.formaPagamento}</td>
                    <td>R$ ${venda.total.toFixed(2)}</td>
                    <td>
                        <button class="btn-acao btn-ver" onclick="verDetalhes(${venda.id})">Ver</button>
                        ${!venda.cancelada ? 
                            `<button class="btn-acao btn-cancelar" onclick="cancelarVenda(${venda.id})">Cancelar</button>` : 
                            '<span class="venda-cancelada">Cancelada</span>'
                        }
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error('Erro ao carregar vendas:', error));
}

// Carregar vendas do mês
function carregarVendasMes() {
    const tbody = document.getElementById('vendas-mes-tbody');
    tbody.innerHTML = ''; // Limpa a tabela

    fetch('/api/vendas/mes')
        .then(response => response.json())
        .then(vendas => {
            // Agrupa vendas por dia
            const vendasPorDia = agruparVendasPorDia(vendas);
            
            Object.entries(vendasPorDia).forEach(([data, vendasDia]) => {
                const total = vendasDia.reduce((sum, venda) => sum + venda.total, 0);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(data).toLocaleDateString()}</td>
                    <td>${vendasDia.length}</td>
                    <td>R$ ${total.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error('Erro ao carregar vendas do mês:', error));
}

// Ver detalhes da venda
function verDetalhes(vendaId) {
    fetch(`/api/vendas/${vendaId}`)
        .then(response => response.json())
        .then(venda => {
            const modal = document.getElementById('modal-detalhes');
            const detalhes = document.getElementById('detalhes-venda');
            
            detalhes.innerHTML = `
                <h3>Venda #${venda.id}</h3>
                <p>Data: ${new Date(venda.data).toLocaleString()}</p>
                <p>Forma de Pagamento: ${venda.formaPagamento}</p>
                <h4>Produtos:</h4>
                <ul>
                    ${venda.itens.map(item => `
                        <li>${item.quantidade}x ${item.produto.nome} - R$ ${item.subtotal.toFixed(2)}</li>
                    `).join('')}
                </ul>
                <p><strong>Total: R$ ${venda.total.toFixed(2)}</strong></p>
            `;
            
            modal.style.display = 'block';
        });
}

// Cancelar venda
function cancelarVenda(vendaId) {
    if (confirm('Tem certeza que deseja cancelar esta venda?')) {
        fetch(`/api/vendas/${vendaId}/cancelar`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Venda cancelada com sucesso!');
                carregarVendasDia(); // Recarrega as vendas
            } else {
                alert('Erro ao cancelar venda: ' + result.message);
            }
        });
    }
}

// Funções auxiliares
function formatarProdutos(itens) {
    return itens.map(item => `${item.quantidade}x ${item.produto.nome}`).join(', ');
}

function agruparVendasPorDia(vendas) {
    return vendas.reduce((acc, venda) => {
        const data = venda.data.split('T')[0];
        if (!acc[data]) {
            acc[data] = [];
        }
        acc[data].push(venda);
        return acc;
    }, {});
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Carrega vendas do dia ao iniciar
    mostrarVendasDia();
    
    // Configura fechamento do modal
    const modal = document.getElementById('modal-detalhes');
    const span = document.querySelector('.fechar-modal');
    
    span.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});