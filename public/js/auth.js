// Verifica se o usuário está autenticado ao carregar cada página
document.addEventListener('DOMContentLoaded', function() {
    // Não verificar autenticação nas páginas públicas
    const publicPages = ['/login', '/cadastro', '/'];
    const currentPath = window.location.pathname;
    
    if (publicPages.includes(currentPath) || currentPath.endsWith('login.html') || currentPath.endsWith('cadastro.html') || currentPath.endsWith('index.html')) {
        return;
    }
    
    // Verifica se o usuário está autenticado para acessar as demais páginas
    verificarAutenticacao();
});

// Função para verificar se o usuário está autenticado
function verificarAutenticacao() {
    const token = localStorage.getItem('authToken');
    
    // Se não tiver token, redireciona para login
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    // Verificar validade do token no servidor
    fetch('/api/users/verificar', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Token inválido');
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.autenticado) {
            throw new Error('Não autenticado');
        }
        
        // Se estiver autenticado, adiciona info do usuário na página
        if (data.usuario) {
            adicionarInfoUsuario(data.usuario);
        }
    })
    .catch(error => {
        console.error('Erro de autenticação:', error);
        // Limpa localStorage e redireciona
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        window.location.href = '/login.html';
    });
}

// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Função para adicionar informações do usuário na página (opcional)
function adicionarInfoUsuario(usuario) {
    // Adiciona o nome do usuário na interface se existir um elemento para isso
    const userInfoElement = document.getElementById('usuario-info');
    if (userInfoElement && usuario && usuario.nome) {
        userInfoElement.textContent = usuario.nome;
    }
}

// Função para fazer logout
function fazerLogout() {
    // Remove o token do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
    
    // Faz uma requisição para o servidor para invalidar o token
    fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        // Redireciona para a página de login
        window.location.href = '/login.html';
    })
    .catch(error => {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, redireciona para a página de login
        window.location.href = '/login.html';
    });
}

// Expor a função globalmente para que possa ser chamada pelo onclick
window.fazerLogout = fazerLogout;

// Adiciona evento de click ao botão de logout se existir
// Função de logout pode ser chamada programaticamente quando necessário
