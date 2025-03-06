/**
 * Script para corrigir automaticamente chamadas de API em arquivos JavaScript
 * Garante que todas as chamadas fetch e XMLHttpRequest usem autenticação corretamente
 */

const fs = require('fs');
const path = require('path');

// Diretório que contém os arquivos JavaScript
const jsDir = path.join(__dirname, '../public/js');

// Lista de todos os arquivos JavaScript
const jsFiles = fs.readdirSync(jsDir)
    .filter(file => file.endsWith('.js') && file !== 'auth.js' && file !== 'auth-fix.js');

// Contador de correções
let totalCorrecoes = 0;
const estatisticas = {
    fetchSemHeaders: 0,
    fetchSemAuthHeaders: 0,
    xhrSemAuth: 0
};

// Função para adicionar a função getAuthHeaders() se não existir no arquivo
function adicionarGetAuthHeaders(conteudo) {
    if (!conteudo.includes('function getAuthHeaders()')) {
        const getAuthHeadersFunc = `
// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? \`Bearer \${token}\` : ''
    };
}
`;
        // Adicionar no início do arquivo
        return getAuthHeadersFunc + conteudo;
    }
    return conteudo;
}

// Processar cada arquivo JavaScript
jsFiles.forEach(filename => {
    try {
        const filePath = path.join(jsDir, filename);
        let conteudo = fs.readFileSync(filePath, 'utf8');
        let modificado = false;
        
        // 1. Corrigir fetch sem headers
        const fetchSemHeadersRegex = /fetch\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g;
        const fetchSemHeadersMatch = conteudo.match(fetchSemHeadersRegex);
        
        if (fetchSemHeadersMatch) {
            conteudo = conteudo.replace(fetchSemHeadersRegex, 'fetch($1$2$1, { headers: getAuthHeaders() })');
            estatisticas.fetchSemHeaders += fetchSemHeadersMatch.length;
            modificado = true;
        }
        
        // 2. Corrigir fetch com headers incorretos
        const fetchHeadersIncorretosRegex = /headers\s*:\s*{([^}]*)}/g;
        const fetchHeadersIncorretosMatch = conteudo.match(fetchHeadersIncorretosRegex);
        
        if (fetchHeadersIncorretosMatch) {
            // Só substitui se não tiver getAuthHeaders()
            if (!conteudo.includes('headers: getAuthHeaders()')) {
                conteudo = conteudo.replace(fetchHeadersIncorretosRegex, (match) => {
                    // Não substituir se já usar getAuthHeaders
                    if (match.includes('getAuthHeaders')) return match;
                    
                    estatisticas.fetchSemAuthHeaders++;
                    return 'headers: getAuthHeaders()';
                });
                modificado = true;
            }
        }
        
        // 3. Corrigir XMLHttpRequest sem cabeçalho de autorização
        const xhrOpenRegex = /(xhr\.open\([^)]*\))/g;
        const xhrOpenMatch = conteudo.match(xhrOpenRegex);
        
        if (xhrOpenMatch && !conteudo.includes('xhr.setRequestHeader(\'Authorization\'')) {
            conteudo = conteudo.replace(xhrOpenRegex, '$1;\n    const token = localStorage.getItem("authToken");\n    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`)');
            estatisticas.xhrSemAuth += xhrOpenMatch.length;
            modificado = true;
        }
        
        // 4. Adicionar a função getAuthHeaders() se necessário e se foram feitas correções
        if (modificado) {
            conteudo = adicionarGetAuthHeaders(conteudo);
            
            // Salvar o arquivo
            fs.writeFileSync(filePath, conteudo);
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
console.log('\n===== RELATÓRIO DE CORREÇÕES DE API =====\n');
console.log(`Total de arquivos processados: ${jsFiles.length}`);
console.log(`Arquivos modificados: ${totalCorrecoes}`);
console.log('\nCorreções realizadas:');
console.log(`- Chamadas fetch sem headers corrigidas: ${estatisticas.fetchSemHeaders}`);
console.log(`- Chamadas fetch com headers incorretos corrigidas: ${estatisticas.fetchSemAuthHeaders}`);
console.log(`- XMLHttpRequests sem auth corrigidos: ${estatisticas.xhrSemAuth}`);

console.log('\nProcesso de correção de APIs concluído!');
