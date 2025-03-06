// Função para obter os headers de autenticação - usar a função global ou criar fallback
function obterAuthHeaders() {
    if (window.getAuthHeadersGlobal) {
        return window.getAuthHeadersGlobal();
    }
    // Fallback caso a função global não esteja disponível
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Variáveis globais
let todosProdutos = [];
let configAlerta = {
    nivelBaixo: 10,
    nivelCritico: 5
};

// Carrega configurações salvas no localStorage ou usa valores padrão
function carregarConfiguracoes() {
    const configSalva = localStorage.getItem('configAlertaEstoque');
    if (configSalva) {
        configAlerta = JSON.parse(configSalva);
        document.getElementById('nivelBaixo').value = configAlerta.nivelBaixo;
        document.getElementById('nivelCritico').value = configAlerta.nivelCritico;
    }
}

// Salva configurações no localStorage
function salvarConfiguracoes() {
    const nivelBaixo = parseInt(document.getElementById('nivelBaixo').value) || 10;
    const nivelCritico = parseInt(document.getElementById('nivelCritico').value) || 5;
    
    // Validar que nivelBaixo é maior que nivelCritico
    if (nivelBaixo <= nivelCritico) {
        alert('O nível de estoque baixo deve ser maior que o nível crítico.');
        return;
    }
    
    configAlerta = {
        nivelBaixo,
        nivelCritico
    };
    
    localStorage.setItem('configAlertaEstoque', JSON.stringify(configAlerta));
    alert('Configurações salvas com sucesso!');
    atualizarListagem(todosProdutos);
}

// Carregar produtos da API
async function carregarProdutos() {
    try {
        const response = await fetch('/api/produtos', { 
            headers: obterAuthHeaders() 
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar produtos: ' + response.status);
        }
        
        todosProdutos = await response.json();
        atualizarResumo(todosProdutos);
        atualizarListagem(todosProdutos);
        
        // Extrair categorias dos produtos
        extrairECarregarCategorias(todosProdutos);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('listaEstoque').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: white; border-radius: 12px;">
                <p style="color: #e74c3c; font-size: 1.2rem;">Erro ao carregar produtos. Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

// Extrair categorias dos produtos e carregá-las no seletor
function extrairECarregarCategorias(produtos) {
    try {
        // Criar um objeto para armazenar categorias únicas (id -> nome)
        const categoriasUnicas = {};
        
        // Extrair categorias únicas dos produtos
        produtos.forEach(produto => {
            if (produto.categoria_id && produto.categoria) {
                categoriasUnicas[produto.categoria_id] = produto.categoria;
            }
        });
        
        // Atualiza o filtro de categorias
        const seletorCategorias = document.getElementById('filtroCategoria');
        seletorCategorias.innerHTML = '<option value="">Todas as Categorias</option>';
        
        // Adicionar cada categoria como uma opção
        Object.entries(categoriasUnicas).forEach(([id, nome]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = nome;
            seletorCategorias.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao extrair categorias:', error);
    }
}

// Atualizar contadores no resumo
function atualizarResumo(produtos) {
    const totalProdutos = produtos.length;
    let estoqueBaixo = 0;
    let estoqueCritico = 0;
    let estoqueZerado = 0;
    
    produtos.forEach(produto => {
        const quantidade = parseInt(produto.quantidade) || 0;
        
        if (quantidade === 0) {
            estoqueZerado++;
        } else if (quantidade <= configAlerta.nivelCritico) {
            estoqueCritico++;
        } else if (quantidade <= configAlerta.nivelBaixo) {
            estoqueBaixo++;
        }
    });
    
    document.getElementById('totalProdutos').textContent = totalProdutos;
    document.getElementById('estoqueBaixo').textContent = estoqueBaixo;
    document.getElementById('estoqueCritico').textContent = estoqueCritico;
    document.getElementById('estoqueZerado').textContent = estoqueZerado;
}

// Atualizar listagem de produtos
function atualizarListagem(produtos) {
    const lista = document.getElementById('listaEstoque');
    
    if (produtos.length === 0) {
        lista.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: white; border-radius: 12px;">
                <p>Nenhum produto encontrado com os filtros selecionados.</p>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = produtos.map(produto => {
        const quantidade = parseInt(produto.quantidade) || 0;
        let classeEstoque, statusEstoque;
        
        if (quantidade === 0) {
            classeEstoque = 'estoque-zerado';
            statusEstoque = 'Sem estoque';
        } else if (quantidade <= configAlerta.nivelCritico) {
            classeEstoque = 'estoque-critico';
            statusEstoque = 'Estoque crítico';
        } else if (quantidade <= configAlerta.nivelBaixo) {
            classeEstoque = 'estoque-baixo';
            statusEstoque = 'Estoque baixo';
        } else {
            classeEstoque = 'estoque-normal';
            statusEstoque = 'Estoque normal';
        }
        
        return `
            <div class="produto-item">
                <div class="categoria">${produto.categoria || getCategoriaName(produto.categoria_id)}</div>
                <div class="nome">${produto.nome}</div>
                <div class="preco">Preço: R$ ${parseFloat(produto.preco).toFixed(2)}</div>
                <div class="estoque ${classeEstoque}">
                    ${statusEstoque}: ${quantidade} unidades
                </div>
                ${produto.codigo ? `<div class="codigo">Código: ${produto.codigo}</div>` : ''}
                <div class="acoes">
                    <button class="btn-repor" onclick="abrirModalReposicao(${produto.id})">Repor Estoque</button>
                    <button class="btn-editar" onclick="redirecionarParaEdicao(${produto.id})">Editar</button>
                </div>
            </div>
        `;
    }).join('');
}

// Função para obter o nome da categoria a partir do ID
function getCategoriaName(categoriaId) {
    const categorias = {
        1: "Incensos",
        2: "Pedras",
        3: "Pingentes",
        4: "Anéis",
        5: "Pulseiras",
        6: "Imagens",
        7: "Óleos",
        8: "Essências",
        9: "Incensários",
        10: "Sinos de Vento",
        11: "Colchas",
        12: "Panos",
        13: "Duendes",
        14: "Bruxas",
        15: "Fadas",
        16: "Livros",
        17: "Oráculos",
        18: "Mandalas",
        19: "Prismas",
        20: "Roupas Indianas",
        21: "Fontes"
    };
    
    return categorias[categoriaId] || "Categoria Desconhecida";
}

// Filtrar produtos
function filtrarProdutos() {
    const categoriaId = document.getElementById('filtroCategoria').value;
    const filtroEstoque = document.getElementById('filtroEstoque').value;
    
    let produtosFiltrados = [...todosProdutos];
    
    // Filtrar por categoria
    if (categoriaId) {
        produtosFiltrados = produtosFiltrados.filter(p => p.categoria_id == categoriaId);
    }
    
    // Filtrar por nível de estoque
    if (filtroEstoque !== 'todos') {
        produtosFiltrados = produtosFiltrados.filter(p => {
            const quantidade = parseInt(p.quantidade) || 0;
            
            switch (filtroEstoque) {
                case 'baixo':
                    return quantidade <= configAlerta.nivelBaixo && quantidade > configAlerta.nivelCritico;
                case 'critico':
                    return quantidade <= configAlerta.nivelCritico && quantidade > 0;
                case 'zerado':
                    return quantidade === 0;
                default:
                    return true;
            }
        });
    }
    
    atualizarListagem(produtosFiltrados);
}

// Abrir modal de reposição
function abrirModalReposicao(produtoId) {
    const produto = todosProdutos.find(p => p.id === produtoId);
    if (!produto) return;
    
    document.getElementById('nomeProduto').textContent = produto.nome;
    document.getElementById('categoriaProduto').textContent = produto.categoria || getCategoriaName(produto.categoria_id);
    document.getElementById('estoqueAtual').textContent = produto.quantidade;
    document.getElementById('quantidadeRepor').value = '';
    
    const modal = document.getElementById('reposicaoModal');
    modal.style.display = 'flex';
    
    // Configurar o formulário
    document.getElementById('reposicaoForm').onsubmit = function(e) {
        e.preventDefault();
        reporEstoque(produtoId);
    };
}

// Fechar modal de reposição
function fecharModalReposicao() {
    document.getElementById('reposicaoModal').style.display = 'none';
}

// Repor estoque
async function reporEstoque(produtoId) {
    const quantidade = parseInt(document.getElementById('quantidadeRepor').value);
    
    if (!quantidade || quantidade <= 0) {
        alert('Por favor, informe uma quantidade válida.');
        return;
    }
    
    try {
        const response = await fetch(`/api/produtos/${produtoId}/estoque/devolver`, {
            method: 'PUT',
            headers: obterAuthHeaders(),
            body: JSON.stringify({ quantidade })
        });
        
        if (!response.ok) {
            throw new Error('Erro ao repor estoque');
        }
        
        const resultado = await response.json();
        
        if (resultado.success) {
            alert('Estoque atualizado com sucesso!');
            fecharModalReposicao();
            await carregarProdutos(); // Recarrega todos os produtos
        } else {
            alert(`Erro: ${resultado.message}`);
        }
    } catch (error) {
        console.error('Erro ao repor estoque:', error);
        alert('Erro ao repor estoque. Tente novamente.');
    }
}

// Redirecionar para a página de edição de produtos
function redirecionarParaEdicao(produtoId) {
    // Armazenar o ID do produto para edição
    sessionStorage.setItem('editarProdutoId', produtoId);
    window.location.href = '/produtoLista.html';
}

// Imprimir relatório
function imprimirRelatorio() {
    // Preparar a janela de impressão
    const janelaImpressao = window.open('', '_blank');
    
    // Filtrar produtos conforme os filtros atuais
    const categoriaId = document.getElementById('filtroCategoria').value;
    const filtroEstoque = document.getElementById('filtroEstoque').value;
    
    let produtosFiltrados = [...todosProdutos];
    
    // Filtrar por categoria
    if (categoriaId) {
        produtosFiltrados = produtosFiltrados.filter(p => p.categoria_id == categoriaId);
    }
    
    // Filtrar por nível de estoque
    if (filtroEstoque !== 'todos') {
        produtosFiltrados = produtosFiltrados.filter(p => {
            const quantidade = parseInt(p.quantidade) || 0;
            
            switch (filtroEstoque) {
                case 'baixo':
                    return quantidade <= configAlerta.nivelBaixo && quantidade > configAlerta.nivelCritico;
                case 'critico':
                    return quantidade <= configAlerta.nivelCritico && quantidade > 0;
                case 'zerado':
                    return quantidade === 0;
                default:
                    return true;
            }
        });
    }
    
    // Ordenar para que os produtos com estoque mais crítico apareçam primeiro
    produtosFiltrados.sort((a, b) => {
        return (parseInt(a.quantidade) || 0) - (parseInt(b.quantidade) || 0);
    });
    
    // Gerar o conteúdo HTML do relatório
    let titulo = 'Relatório de Estoque';
    if (filtroEstoque !== 'todos') {
        switch (filtroEstoque) {
            case 'baixo':
                titulo += ' - Produtos com Estoque Baixo';
                break;
            case 'critico':
                titulo += ' - Produtos com Estoque Crítico';
                break;
            case 'zerado':
                titulo += ' - Produtos Sem Estoque';
                break;
        }
    }
    
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    const conteudoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${titulo}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                h1 {
                    text-align: center;
                    color: #16a085;
                }
                .data {
                    text-align: right;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .estoque-normal {
                    color: #16a085;
                }
                .estoque-baixo {
                    color: #f39c12;
                }
                .estoque-critico {
                    color: #e74c3c;
                }
                .estoque-zerado {
                    color: #c0392b;
                    font-weight: bold;
                }
                .resumo {
                    margin-top: 30px;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                @media print {
                    table { page-break-inside: auto }
                    tr { page-break-inside: avoid; page-break-after: auto }
                    thead { display: table-header-group }
                }
            </style>
        </head>
        <body>
            <h1>${titulo}</h1>
            <div class="data">Data: ${hoje}</div>
            
            <table>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${produtosFiltrados.map(produto => {
                        const quantidade = parseInt(produto.quantidade) || 0;
                        let classeEstoque, statusEstoque;
                        
                        if (quantidade === 0) {
                            classeEstoque = 'estoque-zerado';
                            statusEstoque = 'Sem estoque';
                        } else if (quantidade <= configAlerta.nivelCritico) {
                            classeEstoque = 'estoque-critico';
                            statusEstoque = 'Estoque crítico';
                        } else if (quantidade <= configAlerta.nivelBaixo) {
                            classeEstoque = 'estoque-baixo';
                            statusEstoque = 'Estoque baixo';
                        } else {
                            classeEstoque = 'estoque-normal';
                            statusEstoque = 'Estoque normal';
                        }
                        
                        return `
                            <tr>
                                <td>${produto.nome}</td>
                                <td>${produto.categoria || getCategoriaName(produto.categoria_id)}</td>
                                <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                                <td>${quantidade}</td>
                                <td class="${classeEstoque}">${statusEstoque}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <div class="resumo">
                <p><strong>Total de produtos:</strong> ${produtosFiltrados.length}</p>
                <p><strong>Configurações de alerta:</strong></p>
                <p>Nível de estoque baixo: ${configAlerta.nivelBaixo} unidades</p>
                <p>Nível de estoque crítico: ${configAlerta.nivelCritico} unidades</p>
            </div>
        </body>
        </html>
    `;
    
    janelaImpressao.document.write(conteudoHTML);
    janelaImpressao.document.close();
    
    // Aguarda o carregamento do documento e imprime
    setTimeout(() => {
        janelaImpressao.print();
    }, 500);
}

// Inicializar a página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação ao carregar a página
    if (window.verifyAuthenticationGlobal) {
        window.verifyAuthenticationGlobal();
    }
    
    // Configurar o botão de logout
    if (window.setupLogoutButtonGlobal) {
        window.setupLogoutButtonGlobal();
    }
    
    // Carregar configurações
    carregarConfiguracoes();
    
    // Carregar produtos
    carregarProdutos();
    
    // Configurar eventos
    document.getElementById('filtroCategoria').addEventListener('change', filtrarProdutos);
    document.getElementById('filtroEstoque').addEventListener('change', filtrarProdutos);
    document.getElementById('btnSalvarConfig').addEventListener('click', salvarConfiguracoes);
    document.getElementById('btnImprimir').addEventListener('click', imprimirRelatorio);
    
    // Fechar modal se clicar fora
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('reposicaoModal');
        if (event.target === modal) {
            fecharModalReposicao();
        }
    });
});
