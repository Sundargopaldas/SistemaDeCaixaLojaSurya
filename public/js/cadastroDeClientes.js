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

document.getElementById('clienteForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
    nome: document.getElementById('nome').value,
    endereco: document.getElementById('endereco').value,
    telefone: document.getElementById('telefone').value,
    dataNascimento: document.getElementById('dataNascimento').value
};

    // Garantir que a data está no formato correto (YYYY-MM-DD)
    let dataCorrigida = formData.dataNascimento;
    try {
        // Converter para objeto Date e depois para ISO string no formato YYYY-MM-DD
        const dataObj = new Date(formData.dataNascimento + 'T12:00:00'); // Adiciona meio-dia para evitar problemas de fuso
        if (!isNaN(dataObj.getTime())) {
            // Extrair apenas o componente de data (YYYY-MM-DD)
            dataCorrigida = dataObj.toISOString().split('T')[0];
            formData.dataNascimento = dataCorrigida;
        }
    } catch (e) {
        console.error('Erro ao processar data:', e);
    }
    
    // Logs para depuração
    const dataSelecionada = new Date(formData.dataNascimento + 'T12:00:00');
    console.log('Data selecionada (objeto):', dataSelecionada);
    console.log('Data selecionada (ISO):', dataSelecionada.toISOString());
    console.log('Data original do input:', formData.dataNascimento);
    console.log('Data corrigida:', dataCorrigida);
    console.log('Data como timestamp:', dataSelecionada.getTime());
    
    // Log de data e hora atual para depuração
    const hoje = new Date(); 
    console.log('Data e hora atuais:', hoje);
    console.log('Hoje (dia):', hoje.getDate());
    console.log('Hoje (mês):', hoje.getMonth() + 1);
    console.log('Data selecionada (dia):', dataSelecionada.getDate());
    console.log('Data selecionada (mês):', dataSelecionada.getMonth() + 1);

    console.log('Dados antes do envio:', JSON.stringify(formData, null, 2));
    try {
        const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: obterAuthHeaders(),
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            alert('Cliente cadastrado com sucesso!');
            const token = localStorage.getItem('authToken');
            window.location.href = '/listaDeClientes?token=' + token;
        } else {
            alert('Erro ao cadastrar cliente: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        alert('Erro ao cadastrar cliente!');
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

// Verificar autenticação ao carregar a página
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
});