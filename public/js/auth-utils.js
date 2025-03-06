/**
 * Utilitários de autenticação para o PDV-Surya
 * Este arquivo centraliza as funções relacionadas à autenticação para uso em todas as páginas
 */

/**
 * Obtém os headers de autenticação para uso em chamadas de API
 * @returns {Object} Objeto com os headers para autenticação
 */
function getAuthHeaders() {
    const authToken = localStorage.getItem('authToken') || getCookie('authToken');
    
    if (!authToken) {
        // Sem logs diretos em funções de produção
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 500); // Pequeno delay para permitir que o console exiba o aviso
        return {}; // Retorna headers vazios
    }
    
    return {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} Verdadeiro se autenticado, falso caso contrário
 */
function isAuthenticated() {
    const authToken = localStorage.getItem('authToken') || getCookie('authToken');
    return !!authToken; // Converte para booleano
}

/**
 * Verifica autenticação para uso assíncrono
 * @returns {Promise<boolean>} Promessa resolvida com verdadeiro se autenticado
 */
function verifyAuthentication() {
    // Verificação real do token
    const authToken = localStorage.getItem('authToken') || getCookie('authToken');
    
    if (!authToken) {
        return Promise.resolve(false);
    }
    
    // Verifica a validade do token com o servidor
    return fetch('/api/users/verify-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            return response.json().then(data => data.valid === true);
        }
        return false;
    })
    .catch(error => {
        // Em caso de erro de rede, assumir que o token é inválido
        console.error('Erro ao verificar token:', error);
        return false;
    });
}

/**
 * Redireciona para a página de login se não autenticado
 */
function checkAuthentication() {
    if (!isAuthenticated()) {
        // Sem logs diretos em funções de produção
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

/**
 * Obtém um cookie pelo nome
 * @param {string} name Nome do cookie
 * @returns {string|null} Valor do cookie ou null se não encontrado
 */
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

/**
 * Realiza o logout do usuário
 */
function fazerLogout() {
    // Limpar dados da sessão
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    // Remover cookies relacionados à autenticação
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Requisição ao endpoint de logout (se existir)
    fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .finally(() => {
        // Redirecionar para a página de login independente do resultado
        window.location.href = '/login.html';
    });
}

/**
 * Adiciona o evento de logout ao botão
 */
function setupLogoutButton() {
    const botaoSair = document.getElementById('botao-sair');
    if (botaoSair) {
        botaoSair.addEventListener('click', function(e) {
            e.preventDefault();
            fazerLogout();
        });
    }
    
    // Configurar todos os links com classe 'logout-link'
    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            fazerLogout();
        });
    });
}

/**
 * Gera um token de refresh para garantir que a sessão continue válida
 * durante o uso da aplicação
 */
function setupTokenRefresh() {
    // Verificar autenticação quando a página carrega
    if (!checkAuthentication()) return;
    
    // Configurar refresh de token a cada 15 minutos (900000ms)
    setInterval(() => {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            // Sem logs diretos em funções de produção
            
            fetch('/api/users/refresh-token', {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include'
            })
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('Falha ao atualizar token');
            })
            .then(data => {
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    // Sem logs diretos em funções de produção
                }
            })
            .catch(error => {
                // Sem logs diretos em funções de produção
                // Se falhar, redirecionar para login após alertar o usuário
                alert('Sua sessão expirou. Por favor, faça login novamente.');
                fazerLogout();
            });
        }
    }, 900000); // 15 minutos
}

/**
 * Retorna o token de autenticação atual
 * @returns {string} Token de autenticação ou string vazia
 */
function authToken() {
    const token = localStorage.getItem('authToken') || getCookie('authToken');
    return token || '';
}

// Configurar botão de logout e refresh de token automaticamente
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setupLogoutButton();
        setupTokenRefresh();
    });
}

// Expor as funções para uso global quando carregado via tag script
if (typeof window !== 'undefined') {
    // Compatibilidade regular
    window.getAuthHeaders = getAuthHeaders;
    window.isAuthenticated = isAuthenticated;
    window.verifyAuthentication = verifyAuthentication;
    window.fazerLogout = fazerLogout;
    window.setupLogoutButton = setupLogoutButton;
    window.setupTokenRefresh = setupTokenRefresh;
    window.authToken = authToken;
    
    // Compatibilidade com código antigo (com sufixo Global)
    window.getAuthHeadersGlobal = getAuthHeaders;
    window.isAuthenticatedGlobal = isAuthenticated;
    window.verifyAuthenticationGlobal = verifyAuthentication;
    window.fazerLogoutGlobal = fazerLogout;
    window.setupLogoutButtonGlobal = setupLogoutButton;
    window.setupTokenRefreshGlobal = setupTokenRefresh;
    window.authTokenGlobal = authToken;
}
