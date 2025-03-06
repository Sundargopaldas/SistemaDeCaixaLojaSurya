// Script de teste para verificar o logout diretamente no navegador
console.log('Script de teste de logout carregado');

// Função para ser executada no console do navegador
function testarLogout() {
    // Encontra o botão de logout
    const botaoSair = document.getElementById('botao-sair');
    
    if (botaoSair) {
        console.log('Botão de sair encontrado:', botaoSair);
        
        // Lista os eventos anexados (apenas informativo)
        console.log('Eventos anexados (não é possível listar todos diretamente)');
        
        // Simula um clique no botão
        console.log('Simulando clique no botão sair...');
        botaoSair.click();
    } else {
        // Busca alternativa por texto
        const links = document.querySelectorAll('a');
        let botaoEncontrado = null;
        
        links.forEach(link => {
            if (link.textContent.trim() === 'Sair') {
                botaoEncontrado = link;
                console.log('Link de Sair encontrado pelo texto:', link);
            }
        });
        
        if (botaoEncontrado) {
            console.log('Simulando clique no link encontrado...');
            botaoEncontrado.click();
        } else {
            console.error('Nenhum botão ou link de logout encontrado na página');
        }
    }
}

// Função para logout manual direto
function logoutManual() {
    console.log('Executando logout manual');
    
    // Remove os itens do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
    
    // Redireciona para a página de login
    window.location.href = '/login.html';
    
    return 'Logout executado!';
}

// Mensagem para o usuário no console
console.log('Para testar o logout, abra o console do navegador (F12) e execute:');
console.log('testarLogout() - Para simular o clique no botão de sair');
console.log('logoutManual() - Para executar o logout diretamente');
