/**
 * Script para corrigir problemas comuns em botões e links em todas as páginas HTML
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Diretório que contém os arquivos HTML
const htmlDir = path.join(__dirname, '../public');

// Lista de todos os arquivos HTML
const htmlFiles = fs.readdirSync(htmlDir)
    .filter(file => file.endsWith('.html'));

// Estatísticas de correções
let totalCorrecoes = 0;
const estatisticas = {
    'links_sem_handler': 0,
    'botoes_sem_type': 0,
    'links_com_sublinhado': 0,
    'botoes_onclick_vazio': 0,
    'adicionar_auth_fix': 0,
    'adicionar_logout': 0
};

// CSS a ser adicionado em todos os arquivos HTML (se não existir)
const cssGlobal = `
<style>
    /* Estilo para remover sublinhado de links que são botões */
    a.btn, a.button, a.btn-novo, a.btn-editar, a.btn-excluir, a.btn-action {
        text-decoration: none !important;
    }
    
    /* Melhorar aparência dos botões */
    .btn, .button, .btn-novo, .btn-editar, .btn-excluir, .btn-action {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
</style>
`;

// Script de logout a ser adicionado (se não existir)
const logoutScript = `
<script>
    // Função global de logout
    function fazerLogout() {
        // Remove tokens de autenticação
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
        // Remove cookies de autenticação (se existirem)
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Faz requisição para logout no servidor
        fetch('/api/users/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .finally(() => {
            // Sempre redireciona para login, mesmo se a requisição falhar
            window.location.href = '/login.html';
        });
    }
    
    // Adiciona handler ao botão de logout ao carregar a página
    document.addEventListener('DOMContentLoaded', function() {
        const logoutBtn = document.getElementById('logout-btn') || 
                        document.getElementById('btn-logout') || 
                        document.getElementById('botao-sair');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', fazerLogout);
        }
    });
</script>
`;

// Processar cada arquivo HTML
htmlFiles.forEach(filename => {
    if (filename === 'login.html' || filename === 'cadastro.html') {
        return; // Pular páginas de login e cadastro
    }
    
    try {
        const filePath = path.join(htmlDir, filename);
        const html = fs.readFileSync(filePath, 'utf8');
        let $ = cheerio.load(html);
        let modificado = false;
        
        // 1. Corrigir links sem handler onClick
        $('a[href="#"]').each((i, elem) => {
            const elemento = $(elem);
            const id = elemento.attr('id');
            const onClick = elemento.attr('onclick');
            
            // Se não tem onClick e parece um botão de logout
            if (!onClick && id && (id.includes('sair') || id.includes('logout'))) {
                elemento.attr('onclick', 'fazerLogout(); return false;');
                estatisticas.links_sem_handler++;
                modificado = true;
            }
        });
        
        // 2. Adicionar type="button" a botões sem tipo
        $('button:not([type])').each((i, elem) => {
            $(elem).attr('type', 'button');
            estatisticas.botoes_sem_type++;
            modificado = true;
        });
        
        // 3. Corrigir botões com onclick vazio
        $('button[onclick=""]').each((i, elem) => {
            $(elem).removeAttr('onclick');
            estatisticas.botoes_onclick_vazio++;
            modificado = true;
        });
        
        // 4. Verificar se o script de auth-fix.js está incluído
        let temAuthFix = false;
        $('script').each((i, elem) => {
            const src = $(elem).attr('src');
            if (src && src.includes('auth-fix.js')) {
                temAuthFix = true;
            }
        });
        
        // Se não tiver auth-fix.js, adicionar (exceto em páginas públicas)
        if (!temAuthFix && !filename.includes('login') && !filename.includes('cadastro')) {
            $('head').append('<script src="js/auth-fix.js" defer></script>');
            estatisticas.adicionar_auth_fix++;
            modificado = true;
        }
        
        // 5. Verificar se contém script de logout
        let temLogoutScript = html.includes('function fazerLogout');
        
        // Se não tiver script de logout, adicionar
        if (!temLogoutScript && !filename.includes('login') && !filename.includes('cadastro')) {
            $('body').append(logoutScript);
            estatisticas.adicionar_logout++;
            modificado = true;
        }
        
        // 6. Adicionar CSS global se não existir estilo para links-botões
        let temCSSBotoes = html.includes('text-decoration: none');
        
        if (!temCSSBotoes) {
            $('head').append(cssGlobal);
            estatisticas.links_com_sublinhado++;
            modificado = true;
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
        console.error(`❌ Erro ao processar ${filename}:`, error.message);
    }
});

// Exibir relatório final
console.log('\n===== RELATÓRIO DE CORREÇÕES =====\n');
console.log(`Total de arquivos processados: ${htmlFiles.length}`);
console.log(`Arquivos modificados: ${totalCorrecoes}`);
console.log('\nCorreções realizadas:');
console.log(`- Links sem handler corrigidos: ${estatisticas.links_sem_handler}`);
console.log(`- Botões sem type corrigidos: ${estatisticas.botoes_sem_type}`);
console.log(`- Links com sublinhado corrigidos: ${estatisticas.links_com_sublinhado}`);
console.log(`- Botões com onclick vazio corrigidos: ${estatisticas.botoes_onclick_vazio}`);
console.log(`- Script auth-fix.js adicionado: ${estatisticas.adicionar_auth_fix}`);
console.log(`- Script de logout adicionado: ${estatisticas.adicionar_logout}`);

console.log('\nProcesso de correção concluído!');
