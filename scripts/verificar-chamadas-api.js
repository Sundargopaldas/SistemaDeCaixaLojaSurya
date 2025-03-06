/**
 * Script para verificar chamadas de API em arquivos JavaScript
 * Verifica se as chamadas fetch e XMLHttpRequest estão usando autenticação corretamente
 */

const fs = require('fs');
const path = require('path');

// Diretório que contém os arquivos JavaScript
const jsDir = path.join(__dirname, '../public/js');

// Lista de todos os arquivos JavaScript
const jsFiles = fs.readdirSync(jsDir)
    .filter(file => file.endsWith('.js') && file !== 'auth.js' && file !== 'auth-fix.js');

// Padrões de chamadas de API para verificar
const padroes = {
    // Fetch sem headers
    fetchSemHeaders: /fetch\s*\(\s*['"`][^'"`]+['"`]\s*\)/g,
    
    // Fetch sem getAuthHeaders
    fetchSemAuthHeaders: /fetch\s*\(\s*['"`][^'"`]+['"`]\s*,\s*\{[^}]*headers\s*:\s*(?!getAuthHeaders\(\))[^}]+\}/g,
    
    // XMLHttpRequest sem setRequestHeader para Authorization
    xhrSemAuth: /new\s+XMLHttpRequest\([^)]*\)[^;]*\.open\([^)]*\)[^;]*(?!\.setRequestHeader\s*\(\s*['"]Authorization['"])/g
};

// Problemas encontrados
const problemas = {};

// Verificar cada arquivo JavaScript
jsFiles.forEach(filename => {
    try {
        const filePath = path.join(jsDir, filename);
        const conteudo = fs.readFileSync(filePath, 'utf8');
        
        // Array para armazenar problemas neste arquivo
        const fileProblems = [];
        
        // Verificar cada padrão
        Object.entries(padroes).forEach(([tipo, regex]) => {
            const matches = conteudo.match(regex);
            
            if (matches && matches.length > 0) {
                fileProblems.push({
                    tipo,
                    ocorrencias: matches.length,
                    exemplos: matches.slice(0, 2) // Mostrar apenas os primeiros 2 exemplos
                });
            }
        });
        
        // Se houver problemas, adicionar ao objeto de problemas
        if (fileProblems.length > 0) {
            problemas[filename] = fileProblems;
        }
        
    } catch (error) {
        console.error(`Erro ao analisar ${filename}:`, error);
    }
});

// Exibir resultados
console.log('\n===== RELATÓRIO DE VERIFICAÇÃO DE CHAMADAS API =====\n');

const arquivosComProblemas = Object.keys(problemas).length;
const totalArquivos = jsFiles.length;

console.log(`Encontrados problemas em ${arquivosComProblemas} de ${totalArquivos} arquivos JavaScript.\n`);

if (arquivosComProblemas > 0) {
    console.log('DETALHES DOS PROBLEMAS ENCONTRADOS:');
    console.log('==================================\n');
    
    Object.keys(problemas).forEach(filename => {
        console.log(`\x1b[1m${filename}\x1b[0m:`);
        
        problemas[filename].forEach(problema => {
            console.log(`  • Problema: ${traduzirTipo(problema.tipo)}`);
            console.log(`    Ocorrências: ${problema.ocorrencias}`);
            console.log('    Exemplos:');
            problema.exemplos.forEach(exemplo => {
                console.log(`      ${exemplo.substring(0, 100)}${exemplo.length > 100 ? '...' : ''}`);
            });
            console.log();
        });
    });
    
    console.log('\nSUGESTÕES DE CORREÇÃO:');
    console.log('====================\n');
    console.log('1. Para chamadas fetch sem headers, modifique para:');
    console.log('   fetch(url, { headers: getAuthHeaders() })');
    console.log();
    console.log('2. Para chamadas fetch com headers incorretos, modifique para:');
    console.log('   headers: getAuthHeaders()');
    console.log();
    console.log('3. Para chamadas XMLHttpRequest, adicione:');
    console.log('   xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("authToken")}`)');
    console.log();
    console.log('Certifique-se de que a função getAuthHeaders() esteja disponível no escopo ou importe auth-fix.js.');
    
} else {
    console.log('Nenhum problema encontrado! Todas as chamadas de API parecem estar usando autenticação corretamente.');
}

console.log('\nVerificação de chamadas API concluída!');

// Função auxiliar para traduzir os tipos de problemas
function traduzirTipo(tipo) {
    switch (tipo) {
        case 'fetchSemHeaders':
            return 'Chamada fetch sem headers de autenticação';
        case 'fetchSemAuthHeaders':
            return 'Chamada fetch com headers personalizados, mas sem usar getAuthHeaders()';
        case 'xhrSemAuth':
            return 'XMLHttpRequest sem cabeçalho de Authorization';
        default:
            return tipo;
    }
}
