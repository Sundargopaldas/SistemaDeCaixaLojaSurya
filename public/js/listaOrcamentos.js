// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
document.addEventListener('DOMContentLoaded', function() {
    const tabelaOrcamentos = document.getElementById('tabelaOrcamentos');
    const buscarCliente = document.getElementById('buscarCliente');
    
    carregarListaOrcamentos();
    
    // Eventos de filtro
    buscarCliente.addEventListener('input', carregarListaOrcamentos);

    function carregarListaOrcamentos() {
        fetch('/api/orcamentos', { headers: getAuthHeaders() })
            .then(response => response.json())
            .then(orcamentos => {
                console.log('Dados recebidos:', orcamentos);
                const termoBusca = buscarCliente.value.toLowerCase();
                
                // Aplica filtros
                const orcamentosFiltrados = orcamentos.filter(orcamento => {
                    return orcamento.cliente.toLowerCase().includes(termoBusca);
                });
                
                // Limpa a tabela
                tabelaOrcamentos.innerHTML = '';
                
                // Preenche com os dados filtrados
                orcamentosFiltrados.forEach(orcamento => {
                    const tr = document.createElement('tr');
                    
                    tr.innerHTML = `
                        <td>${new Date(orcamento.data_criacao).toLocaleDateString()}</td>
                        <td>${orcamento.cliente}</td>
                        <td>${orcamento.produtos || ''}</td>
                        <td>${new Date(orcamento.data_validade).toLocaleDateString()}</td>
                        <td>R$ ${Number(orcamento.total).toFixed(2)}</td>
                        <td>
                            <select class="status-select" data-id="${orcamento.id}">
                                <option value="pendente" ${orcamento.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                                <option value="aprovado" ${orcamento.status === 'aprovado' ? 'selected' : ''}>Aprovado</option>
                                <option value="rejeitado" ${orcamento.status === 'rejeitado' ? 'selected' : ''}>Rejeitado</option>
                            </select>
                        </td>
                        <td class="acoes">
                            <button onclick="editarOrcamento(${orcamento.id})" class="btn-editar">Editar</button>
                            <button onclick="excluirOrcamento(${orcamento.id})" class="btn-excluir">Excluir</button>
                        </td>
                    `;
                    
                    tabelaOrcamentos.appendChild(tr);
                });

                // Adiciona eventos para mudança de status
                document.querySelectorAll('.status-select').forEach(select => {
                    select.addEventListener('change', function() {
                        atualizarStatus(this.dataset.id, this.value);
                    });
                });
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao carregar orçamentos');
            });
    }
});

// Funções globais para as ações
function atualizarStatus(id, novoStatus) {
    fetch(`/api/orcamentos/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: novoStatus })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar status');
        }
        return response.json();
    })
    .then(() => {
        // Recarrega a lista após atualizar
        window.location.reload();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao atualizar status do orçamento');
    });
}

function editarOrcamento(id) {
    window.location.href = `/orcamentos.html?id=${id}`;
}

function excluirOrcamento(id) {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
        fetch(`/api/orcamentos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir orçamento');
            }
            return response.json();
        })
        .then(() => {
            // Recarrega a página após excluir
            window.location.reload();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao excluir orçamento');
        });
    }
}