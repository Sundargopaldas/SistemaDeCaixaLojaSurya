// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('orcamentoForm');
    const itensContainer = document.getElementById('itensContainer');
    const btnAddItem = document.getElementById('btnAddItem');
    const btnCancelar = document.getElementById('btnCancelar');
    const spanTotal = document.getElementById('totalOrcamento');
    
    // Verifica se é edição
    const urlParams = new URLSearchParams(window.location.search);
    const orcamentoId = urlParams.get('id');
    
    if (orcamentoId) {
        // Carrega dados do orçamento para edição
        try {
            const response = await fetch(`/api/orcamentos/${orcamentoId}`, { headers: getAuthHeaders() });
            if (!response.ok) throw new Error('Erro ao carregar orçamento');
            
            const orcamento = await response.json();
            
            // Preenche os campos
            document.getElementById('cliente').value = orcamento.cliente;
            document.getElementById('dataValidade').value = orcamento.data_validade.split('T')[0];
            document.getElementById('condicoesPagamento').value = orcamento.condicoes_pagamento;
            document.getElementById('prazoEntrega').value = orcamento.prazo_entrega;
            document.getElementById('observacoes').value = orcamento.observacoes;
            
            // Limpa o container de itens
            itensContainer.innerHTML = '';
            
            // Adiciona os itens existentes
            orcamento.itens.forEach(item => {
                const itemElement = criarItemOrcamento();
                itemElement.querySelector('.produto').value = item.produto;
                itemElement.querySelector('.quantidade').value = item.quantidade;
                itemElement.querySelector('.valor').value = item.valor_unitario;
                itensContainer.appendChild(itemElement);
            });
            
            calcularTotal();
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar orçamento para edição. Por favor, tente novamente.');
        }
    } else {
        // Novo orçamento - adiciona primeiro item
        itensContainer.appendChild(criarItemOrcamento());
    }

    // Função para criar um novo item de orçamento
    function criarItemOrcamento() {
        const div = document.createElement('div');
        div.className = 'item-orcamento';
        
        div.innerHTML = `
            <input type="text" class="produto" placeholder="Produto" required>
            <input type="number" class="quantidade" value="1" min="1" required>
            <input type="number" class="valor" value="0" step="0.01" min="0" required>
            <button type="button" class="btn-cancelar btn-remover">Remover</button>
        `;

        div.querySelector('.btn-remover').addEventListener('click', function() {
            div.remove();
            calcularTotal();
        });

        div.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', calcularTotal);
            input.addEventListener('keyup', calcularTotal);
        });

        return div;
    }

    // Função para calcular o total
    function calcularTotal() {
        let total = 0;
        const itens = itensContainer.querySelectorAll('.item-orcamento');
        
        itens.forEach(item => {
            const quantidade = parseFloat(item.querySelector('.quantidade').value) || 0;
            const valor = parseFloat(item.querySelector('.valor').value) || 0;
            total += quantidade * valor;
        });

        spanTotal.textContent = total.toFixed(2);
    }

    // Evento para adicionar novo item
    btnAddItem.addEventListener('click', function() {
        itensContainer.appendChild(criarItemOrcamento());
    });

    // Evento para cancelar
    btnCancelar.addEventListener('click', function() {
        if (confirm('Deseja realmente cancelar este orçamento?')) {
            window.location.href = 'listaOrcamentos.html';
        }
    });

    // Evento de submissão do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Coleta os dados do formulário
        const orcamento = {
            cliente: document.getElementById('cliente').value,
            dataValidade: document.getElementById('dataValidade').value,
            condicoesPagamento: document.getElementById('condicoesPagamento').value,
            prazoEntrega: document.getElementById('prazoEntrega').value,
            observacoes: document.getElementById('observacoes').value,
            itens: [],
            total: parseFloat(spanTotal.textContent)
        };

        // Coleta os itens
        const itens = itensContainer.querySelectorAll('.item-orcamento');
        itens.forEach(item => {
            orcamento.itens.push({
                produto: item.querySelector('.produto').value,
                quantidade: parseInt(item.querySelector('.quantidade').value),
                valorUnitario: parseFloat(item.querySelector('.valor').value)
            });
        });

        try {
            const url = orcamentoId ? 
                `/api/orcamentos/${orcamentoId}` : 
                '/api/orcamentos';
                
            const method = orcamentoId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(orcamento)
            });

            if (!response.ok) throw new Error('Erro ao salvar orçamento');

            alert('Orçamento salvo com sucesso!');
            window.location.href = 'listaOrcamentos.html';
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar orçamento. Por favor, tente novamente.');
        }
    });
});