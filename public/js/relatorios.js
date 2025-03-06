// Não precisamos importar via ES6 modules, pois o auth-utils.js já expõe as funções via window
// import { getAuthHeaders, isAuthenticated, verifyAuthentication, fazerLogout } from './auth-utils.js';

// Configuração inicial ao carregar a página
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação - Primeiro verifica se já tem token, depois confirma com o servidor
    const authToken = localStorage.getItem('authToken') || document.cookie.replace(/(?:(?:^|.*;\s*)authToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    
    // Se já temos token, considerar autenticado e continuar, sem fazer chamada adicional ao servidor
    if (authToken) {
        initializePage();
        return;
    }
    
    // Se não temos token, redirecionar para login
    window.location.href = 'login.html';
});

// Função para inicializar a página após confirmação de autenticação
function initializePage() {
    // Preenche o seletor de ano com os anos disponíveis
    const anoSelect = document.getElementById('anoFilter');
    const anoAtual = new Date().getFullYear();
    
    // Limpa as opções existentes
    anoSelect.innerHTML = '';
    
    // Adiciona os anos (ano atual e 4 anos anteriores)
    for (let i = 0; i <= 4; i++) {
        const ano = anoAtual - i;
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        anoSelect.appendChild(option);
    }
    
    // Seleciona o mês atual no seletor de mês
    const mesAtual = new Date().getMonth() + 1; // getMonth() retorna 0-11
    document.getElementById('mesFilter').value = mesAtual;
    
    // Carrega os dados iniciais
    window.filtrarVendas();
    
    // Configura o botão de tema, se existir
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            if (newTheme === 'dark') {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            
            // Salva a preferência do usuário
            localStorage.setItem('theme', newTheme);
        });
    }
    
    // Adicionar event listeners aos filtros
    document.getElementById('mesFilter').addEventListener('change', filtrarVendas);
    document.getElementById('anoFilter').addEventListener('change', filtrarVendas);
}

// Função para filtrar vendas por período
async function filtrarVendas() {
    try {
        const mes = document.getElementById('mesFilter').value;
        const ano = document.getElementById('anoFilter').value;
        const url = `/api/relatorios/produtos-mais-vendidos?mes=${mes}&ano=${ano}`;
        
        // Usar o sistema centralizado de autenticação
        const response = await fetch(url, {
            method: 'GET',
            headers: window.getAuthHeaders()
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Se não autorizado, redirecionar para login
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        // Se não houver dados, exibir mensagem
        if (!responseData || !responseData.length) {
            document.getElementById('produtosMaisVendidosTable').innerHTML = '<tr><td colspan="3" class="text-center">Nenhum produto vendido no período selecionado</td></tr>';
            return;
        }
        
        // Processar e exibir os dados
        exibirTabelaProdutos(responseData);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        document.getElementById('produtosMaisVendidosTable').innerHTML = '<tr><td colspan="3" class="text-center">Erro ao carregar dados</td></tr>';
    }
}

// Função para exibir a tabela de produtos mais vendidos
function exibirTabelaProdutos(dados) {
    const tbody = document.getElementById('produtosMaisVendidosTable');
    if (!tbody) {
        console.error('Elemento produtosMaisVendidosTable não encontrado');
        return;
    }
    
    tbody.innerHTML = '';
    
    dados.forEach((item, index) => {
        const tr = document.createElement('tr');
        
        // Adicionando células
        const tdProduto = document.createElement('td');
        tdProduto.textContent = item.nome;
        
        const tdQuantidade = document.createElement('td');
        tdQuantidade.textContent = item.quantidade;
        
        const tdValor = document.createElement('td');
        const valorFormatado = new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        }).format(item.valor_total || 0);
        tdValor.textContent = valorFormatado;
        
        // Adicionando células à linha
        tr.appendChild(tdProduto);
        tr.appendChild(tdQuantidade);
        tr.appendChild(tdValor);
        
        // Adicionando linha à tabela
        tbody.appendChild(tr);
    });
}

// Função para exibir o gráfico de produtos mais vendidos
function exibirGraficoProdutos(dados) {
    // Implementação do gráfico pode ser adicionada posteriormente
}

// Expor funções globalmente para uso em atributos HTML
window.filtrarVendas = filtrarVendas;