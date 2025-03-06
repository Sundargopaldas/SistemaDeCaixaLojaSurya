// Script para corrigir problemas de autenticação
document.addEventListener('DOMContentLoaded', function() {
    // Função para obter token do localStorage ou cookie
    function getToken() {
        // Tenta obter do localStorage primeiro
        let token = localStorage.getItem('authToken');
        
        // Se não encontrar no localStorage, tenta obter de cookies
        if (!token) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith('authToken=')) {
                    token = cookie.substring('authToken='.length, cookie.length);
                    
                    // Sincroniza o token para o localStorage
                    localStorage.setItem('authToken', token);
                    break;
                }
            }
        }
        
        return token;
    }
    
    // Corrigir headers das chamadas fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // Se for uma chamada para a API
        if (typeof url === 'string' && url.includes('/api/')) {
            const token = getToken();
            
            if (token) {
                // Inicializa o objeto options se não existir
                options = options || {};
                
                // Inicializa o objeto headers se não existir
                options.headers = options.headers || {};
                
                // Define o header de autorização se não estiver presente
                if (!options.headers['Authorization'] && !options.headers['authorization']) {
                    options.headers['Authorization'] = `Bearer ${token}`;
                }
            }
        }
        
        return originalFetch(url, options);
    };
    
    // Verifica se há problemas de autenticação e tenta corrigir
    const token = getToken();
    if (token) {
        // Testa a autenticação para verificar se o token é válido
        fetch('/api/users/verificar', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                // Se o token for inválido, limpa e redireciona para login
                localStorage.removeItem('authToken');
                localStorage.removeItem('usuario');
                
                // Só redireciona se não estiver em páginas públicas
                const publicPages = ['/login.html', '/cadastro.html', '/index.html'];
                const isPublicPage = publicPages.some(page => window.location.pathname.endsWith(page));
                
                if (!isPublicPage) {
                    window.location.href = '/login.html';
                }
            }
        })
        .catch(error => {
            console.error('[AUTH-FIX] Erro ao verificar autenticação:', error);
        });
    } else {
        // Verifica se está em uma página que requer autenticação
        const publicPages = ['/login.html', '/cadastro.html', '/index.html'];
        const isPublicPage = publicPages.some(page => window.location.pathname.endsWith(page));
        
        if (!isPublicPage) {
            window.location.href = '/login.html';
        }
    }
});
