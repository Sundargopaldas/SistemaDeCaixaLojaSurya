// Carregar clientes ao iniciar a página
document.addEventListener('DOMContentLoaded', carregarClientes);

async function carregarClientes() {
    try {
        const response = await fetch('/api/clientes');
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

// Busca de clientes
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.getElementById('clientesTableBody').getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const nome = row.cells[0].textContent.toLowerCase();
        const endereco = row.cells[1].textContent.toLowerCase();
        const telefone = row.cells[2].textContent.toLowerCase();
        
        const matches = nome.includes(searchTerm) || 
                       endereco.includes(searchTerm) || 
                       telefone.includes(searchTerm);
        
        row.style.display = matches ? '' : 'none';
    });
});

// Funções para o modal de edição
function editarCliente(id) {
    fetch(`/api/clientes/${id}`)
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
        headers: {
            'Content-Type': 'application/json'
        },
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
        fetch(`/api/clientes/${id}`, {
            method: 'DELETE'
        })
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