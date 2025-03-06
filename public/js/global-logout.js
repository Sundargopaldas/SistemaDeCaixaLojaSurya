// Garante que a função de logout esteja disponível globalmente
// Este script deve ser incluído APÓS auth.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando funções globais de logout');
    
    // Define a função global de logout caso ainda não exista
    if (typeof window.fazerLogout !== 'function') {
        window.fazerLogout = function() {
            console.log('Executando logout global');
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
        };
        console.log('Função global de logout criada');
    } else {
        console.log('Função global de logout já existia');
    }
    
    // Adiciona um manipulador de eventos para todos os links de logout
    const logoutLinks = document.querySelectorAll('.dropdown-content a');
    logoutLinks.forEach(link => {
        if (link.textContent.includes('Sair')) {
            link.removeAttribute('onclick'); // Remove o atributo onclick
            link.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Link de logout clicado');
                window.fazerLogout();
            });
        }
    });
    
    // Atualiza o texto do ícone de usuário com a primeira letra do nome de usuário
    try {
        const userIconElements = document.querySelectorAll('.user-icon');
        const nomeUsuario = localStorage.getItem('usuario');
        
        if (nomeUsuario && nomeUsuario.length > 0) {
            // Pega a primeira letra do nome
            const letraInicial = nomeUsuario.charAt(0).toUpperCase();
            
            // Atualiza todos os ícones de usuário na página
            userIconElements.forEach(icon => {
                icon.textContent = letraInicial;
            });
            
            // Adiciona o nome completo como título ao passar o mouse
            const userMenuElements = document.querySelectorAll('.user-menu');
            userMenuElements.forEach(menu => {
                menu.setAttribute('title', `Logado como: ${nomeUsuario}`);
            });
        }
    } catch (error) {
        console.error('Erro ao atualizar ícone de usuário:', error);
    }
});
