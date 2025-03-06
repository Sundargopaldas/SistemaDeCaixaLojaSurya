// historico.js

// Função para obter o token de autenticação do localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Função para criar headers com autenticação
function createAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// Funções de controle de estoque 
async function verificarEstoque(produto) {
    try {
        const response = await fetch(`/api/produtos/${produto.id}/estoque`, {
            headers: createAuthHeaders()
        });
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
            headers: createAuthHeaders(),
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

// Funções do histórico
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

function formatarData(dataOriginal) {
    try {
        console.log('Tentando formatar data:', dataOriginal);
        
        // Caso a data seja nula ou indefinida
        if (!dataOriginal) {
            return 'Data indisponível';
        }
        
        // Formatar data diretamente se estiver no formato MySQL (YYYY-MM-DD HH:MM:SS)
        if (typeof dataOriginal === 'string') {
            // Verificar se é um formato de data MySQL válido (YYYY-MM-DD HH:MM:SS)
            const regexMySQLDateTime = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
            if (regexMySQLDateTime.test(dataOriginal)) {
                // Dividir a data e hora
                const [dataParte, horaParte] = dataOriginal.split(' ');
                const [ano, mes, dia] = dataParte.split('-');
                
                // Formatar no estilo brasileiro
                return `${dia}/${mes}/${ano}`;
            }
            
            // Caso seja outro formato de string, tentar converter
            const data = new Date(dataOriginal);
            if (!isNaN(data.getTime())) {
                return data.toLocaleDateString('pt-BR');
            }
        }
        
        // Caso seja um objeto Date
        if (dataOriginal instanceof Date) {
            if (!isNaN(dataOriginal.getTime())) {
                return dataOriginal.toLocaleDateString('pt-BR');
            }
        }
        
        // Se chegou aqui, tente uma abordagem mais flexível
        // Extrair números da string caso seja uma data mal formatada
        if (typeof dataOriginal === 'string') {
            const numeros = dataOriginal.match(/\d+/g);
            if (numeros && numeros.length >= 3) {
                // Assumir que os primeiros números são ano, mês e dia
                const ano = numeros[0].length === 4 ? numeros[0] : numeros[2];
                const mes = numeros[1].padStart(2, '0');
                const dia = (numeros[0].length === 4 ? numeros[2] : numeros[0]).padStart(2, '0');
                
                return `${dia}/${mes}/${ano}`;
            }
        }
        
        // Se nada funcionou, retorne um valor padrão
        console.error('Não foi possível formatar a data:', dataOriginal);
        return 'Data indisponível';
    } catch (e) {
        console.error('Erro ao formatar data:', e, 'Data original:', dataOriginal);
        return 'Data indisponível';
    }
}

function formatarHora(dataOriginal) {
    try {
        console.log('Tentando formatar hora:', dataOriginal);
        
        // Caso a data seja nula ou indefinida
        if (!dataOriginal) {
            return 'Hora indisponível';
        }
        
        // Formatar hora diretamente se estiver no formato MySQL (YYYY-MM-DD HH:MM:SS)
        if (typeof dataOriginal === 'string') {
            // Verificar se é um formato de data MySQL válido (YYYY-MM-DD HH:MM:SS)
            const regexMySQLDateTime = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
            if (regexMySQLDateTime.test(dataOriginal)) {
                // Extrair apenas a parte da hora
                const horaParte = dataOriginal.split(' ')[1];
                // Extrair apenas horas e minutos (remover segundos)
                return horaParte.substring(0, 5);
            }
            
            // Caso seja outro formato de string, tentar converter para Date
            const data = new Date(dataOriginal);
            if (!isNaN(data.getTime())) {
                return data.toLocaleTimeString('pt-BR', {
                    hour: '2-digit', 
                    minute: '2-digit'
                });
            }
        }
        
        // Caso seja um objeto Date
        if (dataOriginal instanceof Date) {
            if (!isNaN(dataOriginal.getTime())) {
                return dataOriginal.toLocaleTimeString('pt-BR', {
                    hour: '2-digit', 
                    minute: '2-digit'
                });
            }
        }
        
        // Se chegou aqui, tente uma abordagem mais flexível
        // Extrair números da string caso seja uma hora mal formatada
        if (typeof dataOriginal === 'string') {
            // Tentar extrair hora e minuto de qualquer formato
            const match = dataOriginal.match(/(\d{1,2})[:.h](\d{2})/);
            if (match) {
                const hora = match[1].padStart(2, '0');
                const minuto = match[2];
                return `${hora}:${minuto}`;
            }
        }
        
        // Se nada funcionou, retorne um valor padrão
        console.error('Não foi possível formatar a hora:', dataOriginal);
        return '00:00';
    } catch (e) {
        console.error('Erro ao formatar hora:', e, 'Data original:', dataOriginal);
        return '00:00';
    }
}

function formatarFormaPagamento(formaPagamento) {
    if (!formaPagamento) return 'Não informado';
    
    // Capitaliza a primeira letra
    return formaPagamento.charAt(0).toUpperCase() + formaPagamento.slice(1);
}

function carregarVendasDia(data = new Date()) {
    const dataFormatada = data.toISOString().split('T')[0];
    const tbody = document.getElementById('vendas-dia-tbody');
    tbody.innerHTML = '<tr><td colspan="6">Carregando vendas...</td></tr>';

    console.log('Buscando vendas para a data:', dataFormatada);
    
    fetch(`/api/vendas/dia?data=${dataFormatada}`, {
        headers: createAuthHeaders()
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(vendas => {
            console.log('Vendas recebidas:', vendas);
            
            tbody.innerHTML = '';
            
            if (vendas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">Nenhuma venda encontrada para esta data</td></tr>';
                return;
            }
            
            vendas.forEach(venda => {
                const total = parseFloat(venda.total || 0);
                const formaPagamento = formatarFormaPagamento(venda.forma_pagamento);
                const statusClass = venda.cancelada ? 'venda-cancelada' : '';
                
                // Melhor tratamento para a exibição dos produtos
                const produtosExibicao = venda.produtos || 'Sem itens';
                
                // Garantir que quantidade seja exibida como número ou "1" se for null/undefined
                const quantidade = venda.quantidade_total !== null && venda.quantidade_total !== undefined 
                    ? parseInt(venda.quantidade_total) 
                    : 1;
                
                // Garantir data válida
                let dataHoraExibicao;
                try {
                    dataHoraExibicao = `${formatarData(venda.data)} ${formatarHora(venda.data)}`;
                } catch (e) {
                    console.error('Erro formatando data/hora:', e);
                    dataHoraExibicao = 'Data não disponível';
                }
                
                const tr = document.createElement('tr');
                tr.className = statusClass;
                tr.innerHTML = `
                    <td>${dataHoraExibicao}</td>
                    <td>${produtosExibicao}</td>
                    <td>${quantidade}</td>
                    <td>${formaPagamento}</td>
                    <td>R$ ${total.toFixed(2)}</td>
                    <td>
                        <button class="btn-acao btn-ver" onclick="verDetalhesVenda(${venda.id})">Ver</button>
                        ${venda.cancelada ? '<span>Cancelada</span>' : 
                        `<button class="btn-acao btn-cancelar" onclick="cancelarVenda(${venda.id})">Cancelar</button>`}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar vendas:', error);
            tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar vendas: ${error.message}</td></tr>`;
        });
}

function verDetalhesVenda(vendaId) {
    fetch(`/api/vendas/${vendaId}`, {
        headers: createAuthHeaders()
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(venda => {
            console.log('Detalhes da venda:', venda);
            
            // Garantir formato de data para evitar "Invalid Date"
            let dataExibicao;
            try {
                dataExibicao = `${formatarData(venda.data)} ${formatarHora(venda.data)}`;
            } catch (e) {
                console.error('Erro ao formatar data nos detalhes:', e);
                dataExibicao = 'Data não disponível';
            }
            
            // Preencher informações básicas da venda no modal
            document.getElementById('venda-id').textContent = venda.id;
            document.getElementById('venda-data').textContent = dataExibicao;
            document.getElementById('venda-quantidade').textContent = venda.quantidade_total || 0;
            
            // Garante que formaPagamento seja válido
            const formaPagamento = formatarFormaPagamento(venda.formaPagamento || venda.forma_pagamento);
            document.getElementById('venda-pagamento').textContent = formaPagamento;
            
            // Formatar valor total
            const valorTotal = parseFloat(venda.total || 0).toFixed(2);
            document.getElementById('venda-total').textContent = valorTotal;
            
            // Calcular e exibir o troco, se houver informação de valor pago
            const trocoContainer = document.getElementById('venda-troco-container');
            if (venda.formaPagamento === 'dinheiro' || venda.forma_pagamento === 'dinheiro') {
                const valorPago = parseFloat(venda.valorPago || venda.valor_pago || 0);
                const total = parseFloat(venda.total || 0);
                
                if (valorPago > 0) {
                    document.getElementById('venda-valor-pago').textContent = valorPago.toFixed(2);
                    document.getElementById('venda-troco').textContent = (valorPago - total).toFixed(2);
                    trocoContainer.style.display = 'block';
                } else {
                    trocoContainer.style.display = 'none';
                }
            } else {
                trocoContainer.style.display = 'none';
            }
            
            // Preencher lista de itens
            const listaItensContainer = document.getElementById('lista-itens');
            listaItensContainer.innerHTML = ''; // Limpar itens anteriores
            
            if (venda.itens && venda.itens.length > 0) {
                venda.itens.forEach(item => {
                    const nomeProduto = item.produto && item.produto.nome ? item.produto.nome : 'Produto não identificado';
                    const subtotal = parseFloat(item.subtotal || 0).toFixed(2);
                    
                    const itemElement = document.createElement('div');
                    itemElement.className = 'item-venda';
                    
                    const itemInfo = document.createElement('div');
                    itemInfo.className = 'item-info';
                    itemInfo.textContent = `${item.quantidade}x ${nomeProduto}`;
                    
                    const itemPreco = document.createElement('div');
                    itemPreco.className = 'item-preco';
                    itemPreco.textContent = `R$ ${subtotal}`;
                    
                    itemElement.appendChild(itemInfo);
                    itemElement.appendChild(itemPreco);
                    listaItensContainer.appendChild(itemElement);
                });
            } else {
                const itemElement = document.createElement('div');
                itemElement.className = 'item-venda';
                itemElement.textContent = 'Nenhum item encontrado';
                listaItensContainer.appendChild(itemElement);
            }
            
            // Abrir o modal
            abrirModal();
        })
        .catch(error => {
            console.error('Erro ao buscar detalhes da venda:', error);
            alert('Erro ao buscar detalhes da venda: ' + error.message);
        });
}

function carregarVendasMes() {
    const tbody = document.getElementById('vendas-mes-tbody');
    tbody.innerHTML = '<tr><td colspan="4">Carregando vendas...</td></tr>';

    fetch('/api/vendas/mes', {
        headers: createAuthHeaders()
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(vendas => {
            console.log('Vendas do mês recebidas:', vendas);
            
            tbody.innerHTML = '';
            
            if (vendas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">Nenhuma venda encontrada para este mês</td></tr>';
                return;
            }
            
            // Agrupa vendas por dia e calcula totais
            const vendasPorDia = vendas.reduce((acc, venda) => {
                // Ignora vendas canceladas
                if (venda.cancelada) return acc;
                
                const dataFormatada = formatarData(venda.data);
                
                if (!acc[dataFormatada]) {
                    acc[dataFormatada] = {
                        data: venda.data,
                        dataFormatada,
                        quantidade: 0,
                        total: 0,
                        vendasCount: 0
                    };
                }
                
                acc[dataFormatada].quantidade += parseInt(venda.quantidade_total || 0);
                acc[dataFormatada].total += parseFloat(venda.total || 0);
                acc[dataFormatada].vendasCount += 1;
                
                return acc;
            }, {});
            
            // Converte o objeto em array e ordena por data (mais recente primeiro)
            const vendasOrdenadas = Object.values(vendasPorDia)
                .sort((a, b) => new Date(b.data) - new Date(a.data));
            
            vendasOrdenadas.forEach(venda => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${venda.dataFormatada}</td>
                    <td>${venda.vendasCount}</td>
                    <td>${venda.quantidade}</td>
                    <td>R$ ${venda.total.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar vendas do mês:', error);
            tbody.innerHTML = `<tr><td colspan="4">Erro ao carregar vendas: ${error.message}</td></tr>`;
        });
}

function cancelarVenda(vendaId) {
    if (!confirm('Tem certeza que deseja cancelar esta venda? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    console.log(`Solicitando cancelamento da venda #${vendaId}`);
    
    fetch(`/api/vendas/${vendaId}/cancelar`, {
        method: 'POST',
        headers: createAuthHeaders()
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Resposta do cancelamento:', data);
            
            let mensagem = data.message || 'Venda cancelada com sucesso';
            
            // Adiciona informação se a venda já estava cancelada
            if (data.alreadyCancelled) {
                mensagem = 'Esta venda já estava cancelada anteriormente.';
            }
            
            alert(mensagem);
            
            // Recarregar a lista de vendas
            carregarVendasDia();
        })
        .catch(error => {
            console.error('Erro ao cancelar venda:', error);
            
            // Mensagem de erro mais detalhada
            let mensagemErro = 'Erro ao cancelar venda';
            if (error.message) {
                mensagemErro += ': ' + error.message;
            }
            
            alert(mensagemErro);
        });
}

// Funções para controlar o modal
function abrirModal() {
    const modal = document.getElementById('modal-detalhes-venda');
    modal.style.display = 'block';
    
    // Impedir o scroll da página quando o modal estiver aberto
    document.body.style.overflow = 'hidden';
}

function fecharModal() {
    const modal = document.getElementById('modal-detalhes-venda');
    modal.style.display = 'none';
    
    // Restaurar o scroll da página
    document.body.style.overflow = 'auto';
}

// Inicializa a página ao carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página de histórico carregada');
    mostrarVendasDia();
    
    // Adicionar event listener para o botão de fechar modal
    const fecharModalBtn = document.querySelector('.fechar-modal');
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModal);
    }
    
    // Fechar o modal quando clicar fora do conteúdo
    const modal = document.getElementById('modal-detalhes-venda');
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                fecharModal();
            }
        });
    }
});