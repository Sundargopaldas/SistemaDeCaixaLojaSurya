// historico.js

// Novas funções para controle de estoque
async function verificarEstoque(produto) {
    try {
        const response = await fetch(`/api/produtos/${produto.id}/estoque`);
        const estoque = await response.json();
        return estoque.quantidade >= produto.quantidade;
    } catch (error) {
        console.error('Erro ao verificar estoque:', error);
        return false;
    }
}

async function atualizarEstoque(produto) {
    try {
        const response = await fetch(`/api/produtos/${produto.id}/estoque`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quantidade: produto.quantidade
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        throw error;
    }
}

async function validarVenda(produtos) {
    for (const produto of produtos) {
        const temEstoque = await verificarEstoque(produto);
        if (!temEstoque) {
            alert(`Produto ${produto.nome} não possui estoque suficiente!`);
            return false;
        }
    }
    return true;
}

// Função para realizar venda com verificação de estoque
async function realizarVenda(venda) {
    if (!await validarVenda(venda.produtos)) {
        return false;
    }

    try {
        const response = await fetch('/api/vendas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(venda)
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            // Atualiza o estoque de cada produto
            for (const produto of venda.produtos) {
                await atualizarEstoque(produto);
            }
            return true;
        } else {
            alert('Erro ao realizar venda: ' + resultado.message);
            return false;
        }
    } catch (error) {
        console.error('Erro ao realizar venda:', error);
        alert('Erro ao realizar venda!');
        return false;
    }
}

// Código existente mantido sem alterações
function mostrarVendasDia() {
    document.getElementById('vendas-dia').style.display = 'block';
    document.getElementById('vendas-mes').style.display = 'none';
    carregarVendasDia();
}

function mostrarVendasMes() {
    document.getElementById('vendas-dia').style.display = 'none';
    document.getElementById('vendas-mes').style.display = 'block';
    carregarVendasMes();
}

function formatarData(data) {
    // Adiciona o 'T' se não existir para garantir que a data seja interpretada como UTC
    if (!data.includes('T')) {
        data = data + 'T00:00:00';
    }
    
    return new Date(data).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',  // Define o fuso horário do Brasil
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
function formatarHora(data) {
    return new Date(data).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function carregarVendasDia(data = new Date()) {
    const dataFormatada = data.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const tbody = document.getElementById('vendas-dia-tbody');
    tbody.innerHTML = '';

    fetch(`/api/vendas/dia?data=${dataFormatada}`)
        .then(response => response.json())
        .then(vendas => {
            vendas.forEach(venda => {
                const total = parseFloat(venda.total || 0);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatarData(venda.data)} ${formatarHora(venda.data)}</td>
                    <td>${venda.produtos || 'Sem itens'}</td>
                    <td>${venda.formaPagamento}</td>
                    <td>R$ ${total.toFixed(2)}</td>
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
function carregarVendasMes() {
    const tbody = document.getElementById('vendas-mes-tbody');
    tbody.innerHTML = '';

    fetch('/api/vendas/mes')
        .then(response => response.json())
        .then(vendas => {
            console.log('Dados recebidos:', vendas); // Debug

            vendas.forEach(venda => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatarData(venda.data)}</td>
                    <td>${venda.totalVendas}</td>
                    <td>R$ ${parseFloat(venda.valorTotal).toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar vendas do mês:', error);
        });
}

function verDetalhes(vendaId) {
    fetch(`/api/vendas/${vendaId}`)
        .then(response => response.json())
        .then(venda => {
            const modal = document.getElementById('modal-detalhes');
            const detalhes = document.getElementById('detalhes-venda');
            
            const itensHtml = venda.itens.map(item => `
                <li>${item.quantidade}x ${item.produto.nome} - R$ ${parseFloat(item.subtotal).toFixed(2)}</li>
            `).join('');

            detalhes.innerHTML = `
                <h3>Venda #${venda.id}</h3>
                <p>Data: ${formatarData(venda.data)} ${formatarHora(venda.data)}</p>
                <p>Forma de Pagamento: ${venda.formaPagamento}</p>
                <h4>Produtos:</h4>
                <ul>${itensHtml}</ul>
                <p><strong>Total: R$ ${parseFloat(venda.total).toFixed(2)}</strong></p>
            `;
            
            modal.style.display = 'block';
        });
}

function cancelarVenda(vendaId) {
    if (confirm('Tem certeza que deseja cancelar esta venda?')) {
        fetch(`/api/vendas/${vendaId}/cancelar`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Venda cancelada com sucesso!');
                carregarVendasDia();
            } else {
                alert('Erro ao cancelar venda: ' + result.message);
            }
        });
    }
}

function formatarProdutos(itens) {
    if (!itens) return '';
    return itens.map(item => `${item.quantidade}x ${item.produto.nome}`).join(', ');
}

function agruparVendasPorDia(vendas) {
    return vendas.reduce((acc, venda) => {
        // Garante que a data seja interpretada no fuso horário correto
        const dataObj = new Date(venda.data);
        const data = dataObj.toISOString().split('T')[0];
        if (!acc[data]) {
            acc[data] = [];
        }
        acc[data].push(venda);
        return acc;
    }, {});
}

document.addEventListener('DOMContentLoaded', () => {
    mostrarVendasDia();
    
    const modal = document.getElementById('modal-detalhes');
    const span = document.querySelector('.fechar-modal');
    
    span.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});