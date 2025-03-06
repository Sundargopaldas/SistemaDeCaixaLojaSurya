/**
 * Script para integrar o arquivo auth-utils.js em todas as páginas HTML do sistema
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Diretório que contém os arquivos HTML
const htmlDir = path.join(__dirname, '../public');

// Lista de todos os arquivos HTML, excluindo login e cadastro
const htmlFiles = fs.readdirSync(htmlDir)
    .filter(file => file.endsWith('.html') && file !== 'login.html' && file !== 'cadastro.html');

// Estatísticas de correções
let totalCorrecoes = 0;
const estatisticas = {
    'adicionado_script_auth': 0,
    'removido_script_duplicado': 0,
    'corrigido_chamadas_api': 0
};

// Processar cada arquivo HTML
htmlFiles.forEach(filename => {
    try {
        const filePath = path.join(htmlDir, filename);
        const html = fs.readFileSync(filePath, 'utf8');
        let $ = cheerio.load(html);
        let modificado = false;
        
        // 1. Verificar se o arquivo auth-utils.js já está incluído
        let scriptAuthUtils = false;
        $('script').each((i, elem) => {
            const src = $(elem).attr('src');
            if (src && (src.includes('auth-utils.js') || src === '/js/auth-utils.js')) {
                scriptAuthUtils = true;
            }
        });
        
        // 2. Se não estiver incluído, adicionar antes de todos os outros scripts
        if (!scriptAuthUtils) {
            // Encontrar o primeiro script para inserir antes dele
            const primeiroScript = $('script[src]').first();
            
            if (primeiroScript.length) {
                $('<script src="/js/auth-utils.js"></script>').insertBefore(primeiroScript);
            } else {
                // Se não houver scripts, adicionar ao final do head
                $('head').append('<script src="/js/auth-utils.js"></script>');
            }
            
            estatisticas.adicionado_script_auth++;
            modificado = true;
        }
        
        // 3. Remover scripts de autenticação duplicados ou antigos
        $('script').each((i, elem) => {
            const conteudo = $(elem).html();
            
            if (conteudo && (
                (conteudo.includes('function getAuthHeaders') && !conteudo.includes('checkAuthentication')) ||
                (conteudo.includes('function fazerLogout') && !conteudo.includes('setupTokenRefresh'))
            )) {
                $(elem).remove();
                estatisticas.removido_script_duplicado++;
                modificado = true;
            }
        });
        
        // 4. Corrigir chamadas de API para usar getAuthHeaders()
        $('script').each((i, elem) => {
            let conteudo = $(elem).html();
            if (conteudo) {
                // Verificar se há chamadas fetch com headers hardcoded
                let conteudoModificado = conteudo;
                
                // Substituir headers de autenticação hardcoded por getAuthHeaders()
                const padraoHeaders = /headers\s*:\s*\{[^}]*['"]Authorization['"][\s]*:[\s]*['"](Bearer\s*)?[\${][^}]+[}]['"][^}]+\}/g;
                if (padraoHeaders.test(conteudo)) {
                    conteudoModificado = conteudo.replace(padraoHeaders, 'headers: getAuthHeaders()');
                    estatisticas.corrigido_chamadas_api++;
                    modificado = true;
                }
                
                // Substituir usos de localStorage.getItem('authToken') por isAuthenticated()
                const padraoAuth = /localStorage\.getItem\(['"]authToken['"]\)/g;
                if (padraoAuth.test(conteudoModificado)) {
                    conteudoModificado = conteudoModificado.replace(padraoAuth, 'isAuthenticated()');
                    estatisticas.corrigido_chamadas_api++;
                    modificado = true;
                }
                
                // Atualizar o conteúdo se foi modificado
                if (conteudoModificado !== conteudo) {
                    $(elem).html(conteudoModificado);
                }
            }
        });
        
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
console.log('\n===== RELATÓRIO DE INTEGRAÇÃO DE AUTH-UTILS =====\n');
console.log(`Total de arquivos processados: ${htmlFiles.length}`);
console.log(`Arquivos modificados: ${totalCorrecoes}`);
console.log('\nCorreções realizadas:');
console.log(`- Scripts auth-utils.js adicionados: ${estatisticas.adicionado_script_auth}`);
console.log(`- Scripts duplicados removidos: ${estatisticas.removido_script_duplicado}`);
console.log(`- Chamadas de API corrigidas: ${estatisticas.corrigido_chamadas_api}`);

console.log('\nProcesso de integração de auth-utils concluído!');
