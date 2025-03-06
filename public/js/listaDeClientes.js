// Função para obter os headers de autenticação - usar função global ou fallback
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

// Carregar clientes ao iniciar a página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
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
    
    carregarClientes();
});

async function carregarClientes() {
    try {
        const response = await fetch('/api/clientes', { headers: obterAuthHeaders() });
        const clientes = await response.json();
        const tbody = document.getElementById('clientesTableBody');
        tbody.innerHTML = '';

       clientes.forEach(cliente => {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.endereco}</td>
        <td>${cliente.telefone}</td>
        <td>
            <button class="btn-acao btn-editar" onclick="editarCliente(${cliente.id})">Editar</button>
            <button class="btn-acao btn-excluir" onclick="excluirCliente(${cliente.id})">Excluir</button>
        </td>
    `;
    tbody.appendChild(tr);
});

    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        alert('Erro ao carregar lista de clientes!');
    }
}

// Funções para o modal de edição
function editarCliente(id) {
    fetch(`/api/clientes/${id}`, { headers: obterAuthHeaders() })
        .then(response => response.json())
        .then(cliente => {
            document.getElementById('editId').value = cliente.id;
            document.getElementById('editNome').value = cliente.nome;
            document.getElementById('editEndereco').value = cliente.endereco;
            document.getElementById('editTelefone').value = cliente.telefone;
            document.getElementById('editModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Erro ao carregar cliente:', error);
            alert('Erro ao carregar dados do cliente!');
        });
}

function fecharModal() {
    document.getElementById('editModal').style.display = 'none';
}
document.querySelector('.close').addEventListener('click', fecharModal);

// Atualizar cliente
document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const data = {
        nome: document.getElementById('editNome').value,
        endereco: document.getElementById('editEndereco').value,
        telefone: document.getElementById('editTelefone').value
    };

    fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: obterAuthHeaders(),
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Cliente atualizado com sucesso!');
            fecharModal();
            carregarClientes();
        } else {
            alert(result.message || 'Erro ao atualizar cliente');
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar cliente:', error);
        alert('Erro ao atualizar cliente!');
    });
});

// Formatar telefone no modal de edição
document.getElementById('editTelefone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        e.target.value = value;
    }
});

// Excluir cliente
function excluirCliente(id) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        fetch(`/api/clientes/${id}`, { headers: obterAuthHeaders(), method: 'DELETE' })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Cliente excluído com sucesso!');
                carregarClientes();
            } else {
                alert(result.message || 'Erro ao excluir cliente');
            }
        })
        .catch(error => {
            console.error('Erro ao excluir cliente:', error);
            alert('Erro ao excluir cliente!');
        });
    }
}

// Fechar modal quando clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        fecharModal();
    }
}
