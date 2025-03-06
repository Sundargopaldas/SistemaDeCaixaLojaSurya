/**
 * navbar.js - Funcionalidades para a navbar padronizada do PDV-Surya
 * Versão: 1.2 - Corrigida para destacar corretamente a página atual
 */

// Função para destacar o link ativo na navbar
function highlightActiveLink() {
    try {
        // Obter a URL atual
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop().toLowerCase() || 'index.html';
        
        console.log('Página atual:', pageName);
        
        // Verificar se devemos processar
        if (!document.querySelector('.nav-menu')) {
            console.error('Navbar não encontrada!');
            return;
        }
        
        // Selecionar todos os links da navbar
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        // Remover qualquer destaque existente
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.classList.remove('highlight-nav');
        });
        
        // Marcar como ativo o link atual
        let found = false;
        navLinks.forEach(link => {
            if (!link.getAttribute('href')) return;
            
            const linkHref = link.getAttribute('href').toLowerCase();
            
            // Ignorar o link de logout
            if (link.id === 'botao-sair') return;
            
            // Verificar correspondência
            if (
                (pageName === linkHref) || 
                (linkHref === pageName) ||
                (currentPath.endsWith(linkHref)) ||
                (pageName === 'index.html' && linkHref === 'caixa.html') || // Destaca "Caixa" quando estiver na página inicial
                (linkHref !== 'index.html' && pageName.includes(linkHref.replace('.html', '')))
            ) {
                console.log('Link ativo encontrado:', linkHref);
                link.classList.add('active');
                found = true;
            }
        });
        
        // Se não encontrou correspondência exata, verificar por palavra-chave
        if (!found && pageName) {
            const pageNameWithoutExt = pageName.replace('.html', '');
            
            // Tratamento especial para index/home
            if (pageNameWithoutExt === 'index' || pageNameWithoutExt === '') {
                const caixaLink = Array.from(navLinks).find(link => 
                    link.getAttribute('href') && 
                    link.getAttribute('href').toLowerCase() === 'caixa.html');
                
                if (caixaLink) {
                    caixaLink.classList.add('active');
                    found = true;
                }
            }
            
            // Tratamento para outras páginas por correspondência parcial
            if (!found) {
                navLinks.forEach(link => {
                    if (!link.getAttribute('href')) return;
                    if (link.id === 'botao-sair') return;
                    
                    const linkText = link.textContent.toLowerCase();
                    const linkHref = link.getAttribute('href').toLowerCase().replace('.html', '');
                    
                    if (pageNameWithoutExt.includes(linkHref) || linkHref.includes(pageNameWithoutExt)) {
                        console.log('Link ativo por correspondência parcial:', linkHref);
                        link.classList.add('active');
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Erro ao destacar link ativo:', error);
    }
}

// Aplicar estilo quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Destacar o link ativo
    highlightActiveLink();
    
    // Confirmar que temos a margem superior correta
    if (document.body.style.marginTop === "" && 
        document.body.style.paddingTop === "" &&
        !document.querySelector('main.main-content')) {
        
        document.body.style.marginTop = '70px';
    }
});

// Se a página já foi carregada, executar imediatamente
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    highlightActiveLink();
}
