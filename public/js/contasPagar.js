
// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
// Variáveis globais
let todasContas = [];

// Funções
function editarConta(id) {
    try {
        const conta = todasContas.find(c => c.id === id);
        if (!conta) {
            console.error('Conta não encontrada:', id);
            return;
        }

        console.log('Conta a ser editada:', conta); // Debug

        // Formatando a data para o formato yyyy-MM-dd
        const dataFormatada = new Date(conta.data_vencimento).toISOString().split('T')[0];

        // Preenchendo o formulário
        const form = document.getElementById('conta-form');
        const fornecedorSelect = form.querySelector('#fornecedor');
        const descricaoInput = form.querySelector('#descricao');
        const valorInput = form.querySelector('#valor');
        const dataInput = form.querySelector('#data_vencimento');
        const observacoesInput = form.querySelector('#observacoes');

        if (fornecedorSelect) fornecedorSelect.value = conta.fornecedor_id;
        if (descricaoInput) descricaoInput.value = conta.descricao || '';
        if (valorInput) valorInput.value = conta.valor;
        if (dataInput) dataInput.value = dataFormatada;
        if (observacoesInput) observacoesInput.value = conta.observacoes || '';

        // Configurando o formulário para modo de edição
        form.dataset.modo = 'editar';
        form.dataset.contaId = id;

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Atualizar Conta';
        }

        // Adicionando botão de cancelar
        if (!document.getElementById('btn-cancelar')) {
            const cancelarBtn = document.createElement('button');
            cancelarBtn.type = 'button';
            cancelarBtn.id = 'btn-cancelar';
            cancelarBtn.className = 'btn btn-cancelar';
            cancelarBtn.textContent = 'Cancelar';
            cancelarBtn.onclick = cancelarEdicao;
            submitButton.parentNode.insertBefore(cancelarBtn, submitButton.nextSibling);
        }
    } catch (error) {
        console.error('Erro ao editar conta:', error);
        alert('Erro ao carregar dados para edição');
    }
}
function cancelarEdicao() {
    const form = document.getElementById('conta-form');
    form.reset();
    form.dataset.modo = 'criar';
    delete form.dataset.contaId;
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Adicionar Conta';
    
    const cancelarBtn = document.getElementById('btn-cancelar');
    if (cancelarBtn) {
        cancelarBtn.remove();
    }
}

async function carregarFornecedores() {
    try {
        const response = await fetch('/api/fornecedores', { headers: getAuthHeaders() });
        const fornecedores = await response.json();
        
        const selectFormulario = document.getElementById('fornecedor');
        const selectFiltro = document.getElementById('filtro-fornecedor');
        
        if (selectFormulario) {
            selectFormulario.innerHTML = '<option value="">Selecione um Fornecedor</option>';
            fornecedores.forEach(fornecedor => {
                selectFormulario.innerHTML += `
                    <option value="${fornecedor.id}">${fornecedor.razao_social}</option>
                `;
            });
        }

        if (selectFiltro) {
            selectFiltro.innerHTML = '<option value="">Todos os Fornecedores</option>';
            fornecedores.forEach(fornecedor => {
                selectFiltro.innerHTML += `
                    <option value="${fornecedor.id}">${fornecedor.razao_social}</option>
                `;
            });
        }
    } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
    }
}

async function carregarContas() {
    try {
        const response = await fetch('/api/contas-pagar', { headers: getAuthHeaders() });
        todasContas = await response.json();
        
        const tbody = document.getElementById('contas-lista');
        tbody.innerHTML = '';

        const filtroStatus = document.getElementById('filtro-status').value;
        const filtroFornecedor = document.getElementById('filtro-fornecedor').value;
        const filtroMes = document.getElementById('filtro-mes').value;

        const contasFiltradas = todasContas.filter(conta => {
            if (filtroStatus && conta.status !== filtroStatus) return false;
            if (filtroFornecedor && conta.fornecedor_id !== parseInt(filtroFornecedor)) return false;
            if (filtroMes) {
                const mesAno = new Date(conta.data_vencimento).toISOString().substring(0, 7);
                if (mesAno !== filtroMes) return false;
            }
            return true;
        });

        contasFiltradas.forEach(conta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${conta.fornecedor_nome || 'N/A'}</td>
                <td>${conta.descricao}</td>
                <td>R$ ${parseFloat(conta.valor).toFixed(2)}</td>
                <td>${formatarData(conta.data_vencimento)}</td>
                <td class="status-${conta.status}">${conta.status || 'pendente'}</td>
                <td>
                    <button class="btn-acao btn-pagar" onclick="marcarComoPago(${conta.id})" 
                            ${conta.status === 'pago' ? 'disabled' : ''}>
                        Pagar
                    </button>
                    <button class="btn-acao btn-editar" onclick="editarConta(${conta.id})">
                        Editar
                    </button>
                    <button class="btn-acao btn-excluir" onclick="deletarConta(${conta.id})">
                        Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar contas');
    }
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

async function marcarComoPago(id) {
    if (!confirm('Confirmar pagamento desta conta?')) return;

    try {
        const response = await fetch(`/api/contas-pagar/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'pago',
                data_pagamento: new Date(, { headers: getAuthHeaders() }).toISOString().split('T')[0]
            })
        });

        if (response.ok) {
            alert('Conta marcada como paga!');
            carregarContas();
        } else {
            alert('Erro ao atualizar status da conta');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar status da conta');
    }
}

async function deletarConta(id) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;

    try {
        const response = await fetch(`/api/contas-pagar/${id, headers: getAuthHeaders() }`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Conta excluída com sucesso!');
            carregarContas();
        } else {
            alert('Erro ao excluir conta');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir conta');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    carregarFornecedores();
    carregarContas();

    // Event listeners para filtros
    document.getElementById('filtro-status').addEventListener('change', carregarContas);
    document.getElementById('filtro-fornecedor').addEventListener('change', carregarContas);
    document.getElementById('filtro-mes').addEventListener('change', carregarContas);

    // Event listener para o formulário
    document.getElementById('conta-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const conta = {
            fornecedor_id: form.fornecedor.value,
            descricao: form.descricao.value,
            valor: parseFloat(form.valor.value),
            data_vencimento: form.data_vencimento.value,
            observacoes: form.observacoes.value
        };

        const url = form.dataset.modo === 'editar' 
            ? `/api/contas-pagar/${form.dataset.contaId}`
            : '/api/contas-pagar';
        const method = form.dataset.modo === 'editar' ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(conta, { headers: getAuthHeaders() })
            });

            if (response.ok) {
                alert(form.dataset.modo === 'editar' ? 'Conta atualizada!' : 'Conta cadastrada!');
                form.reset();
                if (form.dataset.modo === 'editar') {
                    cancelarEdicao();
                }
                carregarContas();
            } else {
                alert('Erro ao salvar conta');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar conta');
        }
    });
});