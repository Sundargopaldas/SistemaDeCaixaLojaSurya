// Script para adicionar debug na função de logout
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('Debug de logout carregado');
    
    // Verifica se a função global fazerLogout existe
    if (typeof window.fazerLogout === 'function') {
        console.log('Função fazerLogout está disponível globalmente');
    } else {
        console.error('Função fazerLogout NÃO está disponível globalmente');
    }
    
    // Adiciona event listener para o menu de usuário
    const logoutLinks = document.querySelectorAll('.dropdown-content a');
    console.log('Links de logout encontrados:', logoutLinks.length);
    
    logoutLinks.forEach(link => {
        // Adiciona um evento de clique direto
        link.addEventListener('click', function(e) {
            console.log('Clique no link de logout detectado');
            if (typeof window.fazerLogout === 'function') {
                console.log('Chamando função fazerLogout');
                window.fazerLogout();
            } else {
                console.error('Função fazerLogout não encontrada ao clicar');
            }
        });
    });
});
