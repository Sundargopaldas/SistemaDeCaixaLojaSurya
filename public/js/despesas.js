
// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
// 1. Variáveis globais
let todosDespesas = [];

// 2. Funções
async function carregarDespesas() {
    try {
        const response = await fetch('/api/despesas', { headers: getAuthHeaders() });
        todosDespesas = await response.json();
        
        const tbody = document.getElementById('despesas-lista');
        tbody.innerHTML = '';

        const filtroStatus = document.getElementById('filtro-status').value;
        const filtroMes = document.getElementById('filtro-mes').value;

        const despesasFiltradas = todosDespesas.filter(despesa => {
            if (filtroStatus && despesa.status !== filtroStatus) return false;
            if (filtroMes) {
                const mesAno = new Date(despesa.data_vencimento).toISOString().substring(0, 7);
                if (mesAno !== filtroMes) return false;
            }
            return true;
        });

        despesasFiltradas.forEach(despesa => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${despesa.descricao}</td>
                <td>R$ ${parseFloat(despesa.valor).toFixed(2)}</td>
                <td>${formatarData(despesa.data_vencimento)}</td>
                <td>${despesa.categoria}</td>
                <td class="status-${despesa.status}">${despesa.status || 'pendente'}</td>
                <td>
                    <button class="btn-acao btn-pagar" onclick="marcarComoPago(${despesa.id})" 
                            ${despesa.status === 'pago' ? 'disabled' : ''}>
                        Pagar
                    </button>
                    <button class="btn-acao btn-editar" onclick="editarDespesa(${despesa.id})">
                        Editar
                    </button>
                    <button class="btn-acao btn-excluir" onclick="deletarDespesa(${despesa.id})">
                        Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar despesas');
    }
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

async function marcarComoPago(id) {
    if (!confirm('Confirmar pagamento desta despesa?')) return;

    try {
        const response = await fetch(`/api/despesas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'pago',
                data_pagamento: new Date(, { headers: getAuthHeaders() }).toISOString().split('T')[0]
            })
        });

        if (response.ok) {
            alert('Despesa marcada como paga!');
            carregarDespesas();
        } else {
            alert('Erro ao atualizar status da despesa');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar status da despesa');
    }
}

async function deletarDespesa(id) {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
        const response = await fetch(`/api/despesas/${id, headers: getAuthHeaders() }`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Despesa excluída com sucesso!');
            carregarDespesas();
        } else {
            alert('Erro ao excluir despesa');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir despesa');
    }
}

function editarDespesa(id) {
    const despesa = todosDespesas.find(d => d.id === id);
    if (!despesa) return;

    // Formatando a data para o formato yyyy-MM-dd
    const data = new Date(despesa.data_vencimento);
    const dataFormatada = data.toISOString().split('T')[0];

    document.getElementById('descricao').value = despesa.descricao;
    document.getElementById('valor').value = despesa.valor;
    document.getElementById('data_vencimento').value = dataFormatada;  // Data formatada
    document.getElementById('categoria').value = despesa.categoria;
    document.getElementById('observacoes').value = despesa.observacoes || '';

    const form = document.getElementById('despesa-form');
    form.dataset.modo = 'editar';
    form.dataset.despesaId = id;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Atualizar Despesa';

    if (!document.getElementById('btn-cancelar')) {
        const cancelarBtn = document.createElement('button');
        cancelarBtn.type = 'button';
        cancelarBtn.id = 'btn-cancelar';
        cancelarBtn.className = 'btn btn-cancelar';
        cancelarBtn.textContent = 'Cancelar';
        cancelarBtn.onclick = cancelarEdicao;
        submitButton.parentNode.insertBefore(cancelarBtn, submitButton.nextSibling);
    }
}

function cancelarEdicao() {
    const form = document.getElementById('despesa-form');
    form.reset();
    form.dataset.modo = 'criar';
    delete form.dataset.despesaId;
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Adicionar Despesa';
    
    const cancelarBtn = document.getElementById('btn-cancelar');
    if (cancelarBtn) {
        cancelarBtn.remove();
    }
}

// 3. Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    carregarDespesas();
    
    document.getElementById('filtro-status').addEventListener('change', carregarDespesas);
    document.getElementById('filtro-mes').addEventListener('change', carregarDespesas);
});

document.getElementById('despesa-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const despesa = {
        descricao: form.descricao.value,
        valor: parseFloat(form.valor.value),
        data_vencimento: form.data_vencimento.value,
        categoria: form.categoria.value,
        observacoes: form.observacoes.value
    };

    const url = form.dataset.modo === 'editar' 
        ? `/api/despesas/${form.dataset.despesaId}`
        : '/api/despesas';
    const method = form.dataset.modo === 'editar' ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(despesa, { headers: getAuthHeaders() })
        });

        if (response.ok) {
            alert(form.dataset.modo === 'editar' ? 'Despesa atualizada!' : 'Despesa cadastrada!');
            form.reset();
            if (form.dataset.modo === 'editar') {
                cancelarEdicao();
            }
            carregarDespesas();
        } else {
            alert('Erro ao salvar despesa');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar despesa');
    }
});