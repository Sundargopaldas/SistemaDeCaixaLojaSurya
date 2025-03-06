// Script simples para garantir o funcionamento do logout
document.addEventListener('DOMContentLoaded', function() {
    // Função de logout direta
    function executarLogout() {
        console.log('Executando logout simples');
        
        // Remove dados do localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        
        // Redireciona para a página de login
        window.location.href = '/login.html';
    }
    
    // Procura pelo botão específico de logout
    const botaoSair = document.getElementById('botao-sair');
    if (botaoSair) {
        console.log('Botão de sair encontrado pelo ID');
        
        // Adiciona o evento de clique
        botaoSair.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Clique no botão de sair detectado');
            executarLogout();
        });
    } else {
        console.log('Botão de sair não encontrado pelo ID, procurando por texto');
        
        // Alternativa: procura por links com texto "Sair"
        const links = document.querySelectorAll('a');
        let encontrado = false;
        
        links.forEach(link => {
            if (link.textContent.trim() === 'Sair') {
                console.log('Link de Sair encontrado pelo texto:', link);
                encontrado = true;
                
                // Adiciona o evento de clique
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Clique em Sair detectado');
                    executarLogout();
                });
            }
        });
        
        if (!encontrado) {
            console.error('Nenhum link de logout encontrado na página');
        }
    }
    
    console.log('Script de logout simples inicializado');
});