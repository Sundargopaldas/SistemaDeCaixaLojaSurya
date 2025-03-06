/**
 * Script para garantir que a funcionalidade de logout esteja presente e funcione corretamente em todas as páginas
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Diretório que contém os arquivos HTML
const htmlDir = path.join(__dirname, '../public');

// Lista de todos os arquivos HTML, excluindo login e cadastro
const htmlFiles = fs.readdirSync(htmlDir)
    .filter(file => file.endsWith('.html') && file !== 'login.html' && file !== 'cadastro.html');

// Script de logout padronizado
const standardLogoutScript = `
<script>
// Função padrão de logout
function fazerLogout() {
    console.log('[LOGOUT] Iniciando processo de logout');
    
    // Remove tokens do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    
    // Remove cookies de autenticação (se existirem)
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Faz requisição para logout no servidor
    fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        console.log('[LOGOUT] Resposta do servidor:', response.ok ? 'Sucesso' : 'Falha');
        // Redireciona para a página de login
        window.location.href = '/login.html';
    })
    .catch(error => {
        console.error('[LOGOUT] Erro ao fazer logout:', error);
        // Mesmo com erro, redireciona para a página de login
        window.location.href = '/login.html';
    });
}

// Adiciona evento de click ao botão de logout quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Busca por vários IDs possíveis para o botão de logout
    const logoutBtn = document.getElementById('logout-btn') || 
                      document.getElementById('btn-logout') || 
                      document.getElementById('botao-sair');
    
    if (logoutBtn) {
        console.log('[LOGOUT] Botão de logout encontrado, adicionando listener');
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fazerLogout();
        });
    } else {
        console.warn('[LOGOUT] Botão de logout não encontrado nesta página');
    }
});
</script>
`;

// Estatísticas de correções
let totalCorrecoes = 0;
const estatisticas = {
    'adicionado_script_logout': 0,
    'substituido_script_logout': 0,
    'corrigido_botao_logout': 0,
    'adicionado_botao_logout': 0
};

// Processar cada arquivo HTML
htmlFiles.forEach(filename => {
    try {
        const filePath = path.join(htmlDir, filename);
        const html = fs.readFileSync(filePath, 'utf8');
        let $ = cheerio.load(html);
        let modificado = false;
        
        // 1. Verificar se existe um script de logout
        const existeScriptLogout = html.includes('function fazerLogout') || 
                                  html.includes('function logout');
        
        // 2. Verificar se existe botão de logout
        let existeBotaoLogout = $('#logout-btn').length > 0 || 
                                $('#btn-logout').length > 0 || 
                                $('#botao-sair').length > 0;
        
        // Se não existir script de logout, adicionar
        if (!existeScriptLogout) {
            $('body').append(standardLogoutScript);
            estatisticas.adicionado_script_logout++;
            modificado = true;
        } 
        // Se existir script de logout, mas for diferente do padrão, substituir
        else if (!html.includes('localStorage.removeItem(\'refreshToken\')')) {
            // Remove o script antigo
            $('script').each((i, elem) => {
                const conteudo = $(elem).html();
                if (conteudo && (conteudo.includes('fazerLogout') || conteudo.includes('function logout'))) {
                    $(elem).remove();
                }
            });
            // Adiciona o novo script
            $('body').append(standardLogoutScript);
            estatisticas.substituido_script_logout++;
            modificado = true;
        }
        
        // 3. Verificar se existe menu com botão de logout
        const existeMenuUser = $('.user-menu').length > 0;
        
        // Se não existir botão de logout, mas existir menu de usuário, adicionar
        if (!existeBotaoLogout && existeMenuUser) {
            $('.dropdown-content').append('<a href="#" id="botao-sair">Sair</a>');
            estatisticas.adicionado_botao_logout++;
            modificado = true;
            existeBotaoLogout = true;
        }
        
        // 4. Se existir botão de logout, garantir que tenha o comportamento correto
        if (existeBotaoLogout) {
            // Remove qualquer onclick existente e deixa para o script padronizado tratar
            $('#logout-btn, #btn-logout, #botao-sair').each((i, elem) => {
                const onclick = $(elem).attr('onclick');
                if (onclick) {
                    $(elem).removeAttr('onclick');
                    estatisticas.corrigido_botao_logout++;
                    modificado = true;
                }
            });
        }
        
        // Salvar o arquivo se houve modificações
        if (modificado) {
            fs.writeFileSync(filePath, $.html());
            totalCorrecoes++;
            console.log(`✅ Corrigido: ${filename}`);
        } else {
            console.log(`✓ Sem problemas: ${filename}`);
        }
        
    } catch (error) {
        console.error(`❌ Erro ao processar ${filename}:`, error);
    }
});

// Exibir relatório final
console.log('\n===== RELATÓRIO DE CORREÇÕES DE LOGOUT =====\n');
console.log(`Total de arquivos processados: ${htmlFiles.length}`);
console.log(`Arquivos modificados: ${totalCorrecoes}`);
console.log('\nCorreções realizadas:');
console.log(`- Scripts de logout adicionados: ${estatisticas.adicionado_script_logout}`);
console.log(`- Scripts de logout substituídos: ${estatisticas.substituido_script_logout}`);
console.log(`- Botões de logout corrigidos: ${estatisticas.corrigido_botao_logout}`);
console.log(`- Botões de logout adicionados: ${estatisticas.adicionado_botao_logout}`);

console.log('\nProcesso de correção de logout concluído!');
