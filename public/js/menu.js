/**
 * menu.js - Script para gerenciar a navegação entre páginas mantendo a autenticação
 * Este script garante que o token de autenticação seja adicionado a todos os links internos
 */

document.addEventListener('DOMContentLoaded', function() {
    // Função para obter o token de autenticação
    function getAuthToken() {
        return localStorage.getItem('authToken');
    }

    // Função para adicionar o token a um URL
    function addTokenToUrl(url) {
        const token = getAuthToken();
        if (!token) return url;
        
        // Verifica se o URL já tem parâmetros
        const hasParams = url.includes('?');
        const separator = hasParams ? '&' : '?';
        
        return `${url}${separator}token=${token}`;
    }

    // Intercepta todos os cliques em links internos
    document.addEventListener('click', function(event) {
        // Verifica se o clique foi em um link
        const link = event.target.closest('a');
        if (!link) return;
        
        // Pega o href do link
        const href = link.getAttribute('href');
        
        // Ignora links externos, emails, telefones, etc.
        if (!href || href.startsWith('http') || href.startsWith('mailto:') || 
            href.startsWith('tel:') || href === '#' || href.startsWith('javascript:')) {
            return;
        }
        
        // Ignora links para login e cadastro
        if (href === '/login' || href === '/login.html' || 
            href === '/cadastro' || href === '/cadastro.html') {
            return;
        }
        
        // Previne o comportamento padrão
        event.preventDefault();
        
        // Redireciona para o URL com o token
        window.location.href = addTokenToUrl(href);
    });
    
    // Adiciona o token às URLs já em links existentes
    function updateExistingLinks() {
        const internalLinks = document.querySelectorAll('a[href^="/"]');
        
        internalLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Ignora links para login e cadastro
            if (href === '/login' || href === '/login.html' || 
                href === '/cadastro' || href === '/cadastro.html') {
                return;
            }
            
            // Atualiza o href para incluir o token
            link.setAttribute('href', addTokenToUrl(href));
        });
    }
    
    // Executa uma vez ao carregar a página
    updateExistingLinks();
});
