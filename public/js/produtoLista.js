// Função para obter os headers de autenticação - usar a função global ou criar fallback
function obterAuthHeaders() {
    if (window.getAuthHeaders) {
        return window.getAuthHeaders();
    }
    // Fallback caso a função global não esteja disponível
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

let todosProdutos = [];

async function carregarProdutos() {
    try {
        const response = await fetch('/api/produtos', { headers: obterAuthHeaders() });
        if (!response.ok) {
            throw new Error('Erro ao carregar produtos: ' + response.status);
        }
        todosProdutos = await response.json();
        atualizarListagem(todosProdutos);
        
        // Extrair categorias dos produtos
        extrairECarregarCategorias(todosProdutos);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('listaProdutos').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: white; border-radius: 12px;">
                <p style="color: #e74c3c; font-size: 1.2rem;">Erro ao carregar produtos. Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

function atualizarListagem(produtos) {
    const lista = document.getElementById('listaProdutos');
    
    if (produtos.length === 0) {
        lista.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: white; border-radius: 12px;">
                <p>Nenhum produto encontrado com os filtros selecionados.</p>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = produtos.map(p => `
        <div class="produto-item">
            <div class="categoria">${getCategoriaName(p.categoria_id)}</div>
            <div class="nome">${p.nome}</div>
            <div class="preco">Preço: R$ ${Number(p.preco).toFixed(2)}</div>
            <div class="estoque">Estoque: ${p.quantidade}</div>
            ${p.codigo ? `<div class="codigo">Código: ${p.codigo}</div>` : ''}
            <div class="acoes">
                <button onclick="editarProduto(${p.id})">Editar</button>
                <button onclick="excluirProduto(${p.id})" class="excluir">Excluir</button>
            </div>
        </div>
    `).join('');
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

// Extrair categorias dos produtos e carregá-las no seletor
function extrairECarregarCategorias(produtos) {
    try {
        // Atualiza o filtro de categorias
        const seletorCategorias = document.getElementById('filtroCategoria');
        seletorCategorias.innerHTML = '<option value="">Todas as Categorias</option>';
        
        // Criar um objeto para armazenar categorias únicas (id -> nome)
        const categoriasUnicas = {};
        
        // Extrair categorias únicas dos produtos
        produtos.forEach(produto => {
            if (produto.categoria_id) {
                const nomeCat = getCategoriaName(produto.categoria_id);
                categoriasUnicas[produto.categoria_id] = nomeCat;
            }
        });
        
        // Adicionar cada categoria como uma opção
        Object.entries(categoriasUnicas).forEach(([id, nome]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = nome;
            seletorCategorias.appendChild(option);
        });
        
        // Atualiza as categorias no formulário de edição
        const seletorCategoriasModal = document.querySelector('#editForm select[name="categoria_id"]');
        if (seletorCategoriasModal) {
            seletorCategoriasModal.innerHTML = '<option value="">Selecione uma categoria</option>';
            
            Object.entries(categoriasUnicas).forEach(([id, nome]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = nome;
                seletorCategoriasModal.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao extrair categorias:', error);
    }
}

async function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
        const response = await fetch(`/api/produtos/${id}`, {
            method: 'DELETE',
            headers: obterAuthHeaders()
        });
        
        if (response.ok) {
            todosProdutos = todosProdutos.filter(p => p.id !== id);
            atualizarListagem(todosProdutos);
            alert('Produto excluído com sucesso!');
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao excluir produto');
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto: ' + error.message);
    }
}

async function editarProduto(id) {
    try {
        // Buscar o produto diretamente da lista de produtos já carregados
        const produto = todosProdutos.find(p => p.id == id);
        
        if (!produto) {
            throw new Error('Produto não encontrado na lista de produtos');
        }
        
        // Preencher o formulário no modal
        const form = document.getElementById('editForm');
        form.categoria_id.value = produto.categoria_id;
        form.nome.value = produto.nome;
        form.preco.value = produto.preco;
        form.quantidade.value = produto.quantidade;
        form.codigo.value = produto.codigo || '';
        
        // Armazenar o ID do produto sendo editado
        form.setAttribute('data-id', id);
        
        // Mostrar o modal
        const modal = document.getElementById('editModal');
        if (modal) {
            modal.style.display = 'flex';
        } else {
            console.error('Modal de edição não encontrado');
            alert('Erro: Modal de edição não encontrado');
            return;
        }
        
        // Configurar o evento de envio do formulário
        form.onsubmit = async (e) => {
            e.preventDefault();
            await salvarEdicao(e);
        };
    } catch (error) {
        console.error('Erro ao editar produto:', error);
        alert('Erro ao editar produto: ' + error.message);
    }
}

async function salvarEdicao(e) {
    e.preventDefault();
    const form = e.target;
    const id = form.getAttribute('data-id');
    
    // Construir objeto de produto
    const produto = {
        categoria_id: parseInt(form.categoria_id.value),
        nome: form.nome.value,
        preco: parseFloat(form.preco.value),
        quantidade: parseInt(form.quantidade.value)
    };
    
    // Adicionar campos adicionais se existirem
    if (form.codigo) {
        produto.codigo = form.codigo.value || null;
    }

    try {
        const response = await fetch(`/api/produtos/${id}`, {
            method: 'PUT',
            headers: obterAuthHeaders(),
            body: JSON.stringify(produto)
        });
        
        if (response.ok) {
            closeModal();
            await carregarProdutos(); // Recarregar a lista após a edição
            alert('Produto atualizado com sucesso!');
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar produto');
        }
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        alert('Erro ao atualizar produto: ' + error.message);
    }
}

function closeModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Função para fechar o modal de edição
function fecharModalEdicao() {
    closeModal();
}

// Função para abrir o modal de edição e preencher com os dados do produto
function abrirModalEdicao(id) {
    const produto = todosProdutos.find(p => p.id === id);
    if (!produto) return;
    
    document.getElementById('editarId').value = produto.id;
    document.getElementById('editarNome').value = produto.nome;
    document.getElementById('editarPreco').value = produto.preco;
    document.getElementById('editarQuantidade').value = produto.quantidade;
    document.getElementById('editarCodigo').value = produto.codigo || '';
    
    // Seleciona a categoria do produto
    const seletorCategoria = document.getElementById('editarCategoria');
    if (seletorCategoria) {
        Array.from(seletorCategoria.options).forEach(option => {
            if (parseInt(option.value) === produto.categoria_id) {
                option.selected = true;
            }
        });
    }
    
    const modal = document.getElementById('editModal');
    modal.style.display = 'flex';
}

// Função para filtrar produtos por categoria
function filtrarPorCategoria(categoriaId) {
    const filtered = categoriaId 
        ? todosProdutos.filter(p => p.categoria_id == categoriaId)
        : todosProdutos;
    
    atualizarListagem(filtered);
}

// Função para filtrar produtos por texto
function filtrarPorTexto(texto) {
    if (!texto || texto.trim() === '') {
        atualizarListagem(todosProdutos);
        return;
    }
    
    const termoBusca = texto.toLowerCase().trim();
    const produtosFiltrados = todosProdutos.filter(produto => {
        // Busca no nome do produto
        if (produto.nome && produto.nome.toLowerCase().includes(termoBusca)) {
            return true;
        }
        
        // Busca no código do produto, se existir
        if (produto.codigo && produto.codigo.toLowerCase().includes(termoBusca)) {
            return true;
        }
        
        // Busca na categoria, se existir
        const nomeCat = getCategoriaName(produto.categoria_id);
        if (nomeCat && nomeCat.toLowerCase().includes(termoBusca)) {
            return true;
        }
        
        return false;
    });
    
    atualizarListagem(produtosFiltrados);
}

// Inicializa a página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação ao carregar a página
    if (window.verifyAuthenticationGlobal) {
        window.verifyAuthenticationGlobal();
    } else {
        // Fallback se a função global não estiver disponível
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }
    }

    // Configurar o botão de logout
    if (window.setupLogoutButtonGlobal) {
        window.setupLogoutButtonGlobal('botao-sair');
    } else {
        // Fallback se a função global não estiver disponível
        const botaoSair = document.getElementById('botao-sair');
        if (botaoSair) {
            botaoSair.addEventListener('click', function() {
                localStorage.removeItem('authToken');
                window.location.href = '/login.html';
            });
        }
    }
    
    carregarProdutos();
    
    // Filtro por categoria
    document.getElementById('filtroCategoria').addEventListener('change', function() {
        filtrarPorCategoria(this.value);
    });
    
    // Filtro por texto - verificar se o elemento existe antes de adicionar o event listener
    const filtroBusca = document.getElementById('filtroBusca');
    if (filtroBusca) {
        filtroBusca.addEventListener('input', function() {
            filtrarPorTexto(this.value);
        });
    }
    
    // Fechar modal ao clicar fora
    const modal = document.getElementById('editModal');
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            fecharModalEdicao();
        }
    });
    
    // Botão de fechar modal
    const btnFecharModal = document.querySelector('.fechar-modal');
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', fecharModalEdicao);
    }
});