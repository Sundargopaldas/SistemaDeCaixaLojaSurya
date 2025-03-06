// Solução final para o problema de logout
document.addEventListener('DOMContentLoaded', function() {
    // Configuração
    const DEBUG = false;
    
    // Função de log condicional
    function log(message) {
        if (DEBUG) console.log('[LOGOUT]', message);
    }
    
    // Função que realiza o logout
    function realizarLogout(event) {
        if (event) event.preventDefault();
        
        try {
            // Limpa o localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('usuario');
            
            // Limpa os cookies se existirem
            document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            
            // Redireciona para página de login
            window.location.href = '/login.html';
        } catch (erro) {
            console.error('Erro ao fazer logout:', erro);
        }
    }
    
    // Torna a função global
    window.realizarLogout = realizarLogout;
    
    // Encontra o botão de logout
    const botaoSair = document.getElementById('botao-sair');
    if (botaoSair) {
        botaoSair.addEventListener('click', realizarLogout);
    } else {
        // Procura por links com texto "Sair"
        let encontrado = false;
        document.querySelectorAll('a').forEach(link => {
            if (link.textContent.trim() === 'Sair') {
                link.addEventListener('click', realizarLogout);
                encontrado = true;
            }
        });
        
        if (!encontrado) {
            console.error('ERRO: Nenhum link de logout encontrado');
        }
    }
});