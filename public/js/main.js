// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
// Essa função será executada quando o documento HTML estiver completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    // Função para obter os headers de autenticação - usar a função global ou criar fallback
    function obterAuthHeaders() {
        if (window.getAuthHeadersGlobal) {
            return window.getAuthHeadersGlobal();
        }
        // Fallback caso a função global não esteja disponível
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }
    
    // Seleciona o formulário de produto
    const produtoForm = document.getElementById('produtoForm');
    
    // Adiciona um evento de submit ao formulário
    if (produtoForm) {
        produtoForm.addEventListener('submit', async function(event) {
            // Previne o comportamento padrão do formulário (recarregar a página)
            event.preventDefault();
            
            // Obtém os valores dos campos do formulário
            const categoria_id = document.querySelector('select[name="categoria_id"]').value;
            const nome = document.querySelector('input[name="nome"]').value;
            const preco = document.querySelector('input[name="preco"]').value;
            const quantidade = document.querySelector('input[name="quantidade"]').value;
            const codigo = document.querySelector('input[name="codigo"]').value;
            
            // Constrói o objeto de produto
            const produto = {
                categoria_id: parseInt(categoria_id),
                nome: nome,
                preco: parseFloat(preco),
                quantidade: parseInt(quantidade),
                codigo: codigo || null
            };
            
            try {
                // Envia os dados do produto para o servidor
                const response = await fetch('/api/produtos', {
                    method: 'POST',
                    headers: obterAuthHeaders(),
                    body: JSON.stringify(produto)
                });
                
                // Verifica se a resposta foi bem-sucedida
                if (response.ok) {
                    alert('Produto cadastrado com sucesso!');
                    produtoForm.reset(); // Limpa o formulário
                } else {
                    // Se a resposta não foi bem-sucedida, exibe uma mensagem de erro
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erro ao cadastrar produto');
                }
            } catch (error) {
                alert(error.message);
                console.error('Erro:', error);
            }
        });
    }
});