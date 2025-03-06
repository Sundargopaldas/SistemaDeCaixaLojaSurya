// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
// Carregar fornecedores ao iniciar a página
// listaDeFornecedores.js
document.addEventListener('DOMContentLoaded', carregarFornecedores);

async function carregarFornecedores() {
    try {
        console.log('Iniciando carregamento de fornecedores...');
        const response = await fetch('/api/fornecedores', { headers: getAuthHeaders() });
        console.log('Resposta:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const fornecedores = await response.json();
        console.log('Fornecedores recebidos:', fornecedores);

        const tableBody = document.getElementById('fornecedoresTableBody');
        
        if (!tableBody) {
            console.error('Elemento fornecedoresTableBody não encontrado!');
            return;
        }

        tableBody.innerHTML = '';
        
        fornecedores.forEach(fornecedor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${fornecedor.razao_social}</td>
                <td>${fornecedor.nome_fantasia || '-'}</td>
                <td>${fornecedor.cnpj}</td>
                <td>${fornecedor.telefone}</td>
                <td>${fornecedor.email || '-'}</td>
                <td>
                    <button onclick="editarFornecedor(${fornecedor.id})" class="btn-editar">Editar</button>
                    <button onclick="excluirFornecedor(${fornecedor.id})" class="btn-excluir">Excluir</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        alert('Erro ao carregar lista de fornecedores!');
    }
}

// Funções para o modal de edição
function editarFornecedor(id) {
    fetch(`/api/fornecedores/${id}`, { headers: getAuthHeaders() })
        .then(response => response.json())
        .then(fornecedor => {
            document.getElementById('editId').value = fornecedor.id;
            document.getElementById('editRazaoSocial').value = fornecedor.razao_social;
            document.getElementById('editNomeFantasia').value = fornecedor.nome_fantasia || '';
            document.getElementById('editCnpj').value = fornecedor.cnpj;
            document.getElementById('editEmail').value = fornecedor.email || '';
            document.getElementById('editTelefone').value = fornecedor.telefone;
            document.getElementById('editEndereco').value = fornecedor.endereco;
            document.getElementById('editModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Erro ao carregar fornecedor:', error);
            alert('Erro ao carregar dados do fornecedor!');
        });
}

// Adicionar esse trecho no seu listaDeFornecedores.js
document.querySelector('.close').addEventListener('click', fecharModal);

function fecharModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
}

// Fechar modal quando clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        fecharModal();
    }
}

// Atualizar fornecedor
document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const data = {
        razao_social: document.getElementById('editRazaoSocial').value,
        nome_fantasia: document.getElementById('editNomeFantasia').value,
        cnpj: document.getElementById('editCnpj').value,
        email: document.getElementById('editEmail').value,
        telefone: document.getElementById('editTelefone').value,
        endereco: document.getElementById('editEndereco').value
    };

    fetch(`/api/fornecedores/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Fornecedor atualizado com sucesso!');
            fecharModal();
            carregarFornecedores();
        } else {
            alert(result.message || 'Erro ao atualizar fornecedor');
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar fornecedor:', error);
        alert('Erro ao atualizar fornecedor!');
    });
});

// Formatações
function formatarCampos() {
    // Formatação do CNPJ no modal
    document.getElementById('editCnpj').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 14) {
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
            e.target.value = value;
        }
    });

    // Formatação do telefone no modal
    document.getElementById('editTelefone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            e.target.value = value;
        }
    });
}
formatarCampos();

// Excluir fornecedor
function excluirFornecedor(id) {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
        fetch(`/api/fornecedores/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Fornecedor excluído com sucesso!');
                carregarFornecedores();
            } else {
                alert(result.message || 'Erro ao excluir fornecedor');
            }
        })
        .catch(error => {
            console.error('Erro ao excluir fornecedor:', error);
            alert('Erro ao excluir fornecedor!');
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