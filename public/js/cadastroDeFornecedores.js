
// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
// No cadastroDeFornecedores.js
document.getElementById('fornecedorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        razao_social: document.getElementById('razaoSocial').value,
        nome_fantasia: document.getElementById('nomeFantasia').value,
        cnpj: document.getElementById('cnpj').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        endereco: document.getElementById('endereco').value
    };

    try {
        const response = await fetch('http://localhost:3001/api/fornecedores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData, { headers: getAuthHeaders() })
        });

        const data = await response.json();

        if (data.success) {
            alert('Fornecedor cadastrado com sucesso!');
            // Usar o caminho correto para redirecionamento
            window.location.href = 'listaDeFornecedores.html';
        } else {
            alert('Erro ao cadastrar fornecedor: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao cadastrar fornecedor:', error);
        alert('Erro ao cadastrar fornecedor!');
    }
});

// Formatação do CNPJ
document.getElementById('cnpj').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
        e.target.value = value;
    }
});

// Formatação do telefone
document.getElementById('telefone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        e.target.value = value;
    }
});