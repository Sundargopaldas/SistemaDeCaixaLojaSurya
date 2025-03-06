/**
 * Script para verificar botões em todas as páginas HTML
 * Verifica problemas comuns como:
 * - Links sem href ou com href inválidos
 * - Botões sem event listeners
 * - Problemas de estilo
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Diretório que contém os arquivos HTML
const htmlDir = path.join(__dirname, '../public');

// Lista de todos os arquivos HTML
const htmlFiles = fs.readdirSync(htmlDir)
    .filter(file => file.endsWith('.html'));

// Problemas encontrados
const problemas = {};

// Verificar cada arquivo HTML
htmlFiles.forEach(filename => {
    try {
        const filePath = path.join(htmlDir, filename);
        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html);
        
        // Array para armazenar problemas neste arquivo
        const fileProblems = [];
        
        // Verificar botões HTML (<button>) e links (<a>)
        const elementos = $('button, a, input[type="button"], input[type="submit"]');
        
        elementos.each((i, elem) => {
            const elemento = $(elem);
            const tagName = elem.tagName.toLowerCase();
            const id = elemento.attr('id') || '[sem ID]';
            const text = elemento.text().trim() || elemento.attr('value') || '[sem texto]';
            const classes = elemento.attr('class') || '[sem classe]';
            
            // Verificar links
            if (tagName === 'a') {
                const href = elemento.attr('href');
                
                // Link sem href
                if (!href) {
                    fileProblems.push({
                        elemento: `Link "${text}" (${id})`,
                        problema: 'Sem atributo href',
                        sugestao: 'Adicionar href válido ou usar onclick'
                    });
                } 
                // Link com # sem JavaScript
                else if (href === '#') {
                    const onClick = elemento.attr('onclick');
                    if (!onClick) {
                        fileProblems.push({
                            elemento: `Link "${text}" (${id})`,
                            problema: 'Href="#" sem handler onclick',
                            sugestao: 'Adicionar função onClick ou href válido'
                        });
                    }
                }
                
                // Remover sublinhado em links que parecem botões
                if (classes.includes('btn') || classes.includes('button')) {
                    if (!classes.includes('text-decoration-none')) {
                        fileProblems.push({
                            elemento: `Link-botão "${text}" (${id})`,
                            problema: 'Potencial sublinhado em link-botão',
                            sugestao: 'Adicionar text-decoration: none no CSS'
                        });
                    }
                }
            }
            
            // Verificar botões
            if (tagName === 'button') {
                const type = elemento.attr('type');
                
                // Botão sem tipo
                if (!type) {
                    fileProblems.push({
                        elemento: `Botão "${text}" (${id})`,
                        problema: 'Sem atributo type',
                        sugestao: 'Adicionar type="button" (ou "submit" em formulários)'
                    });
                }
                
                // Botão com onclick vazio
                const onClick = elemento.attr('onclick');
                if (onClick === '') {
                    fileProblems.push({
                        elemento: `Botão "${text}" (${id})`,
                        problema: 'Atributo onclick vazio',
                        sugestao: 'Remover atributo ou adicionar função válida'
                    });
                }
            }
            
            // Verificar inputs de tipo botão
            if ((tagName === 'input') && 
                (elemento.attr('type') === 'button' || elemento.attr('type') === 'submit')) {
                
                const onClick = elemento.attr('onclick');
                if (!onClick && elemento.attr('type') === 'button') {
                    fileProblems.push({
                        elemento: `Input botão "${elemento.attr('value') || id}"`,
                        problema: 'Sem handler onclick',
                        sugestao: 'Adicionar onclick ou usar addEventListener no script'
                    });
                }
            }
        });
        
        // Verificar se existem scripts referenciados que não existem
        $('script').each((i, elem) => {
            const scriptSrc = $(elem).attr('src');
            
            if (scriptSrc && !scriptSrc.startsWith('http')) {
                const scriptPath = path.join(htmlDir, scriptSrc);
                
                if (!fs.existsSync(scriptPath)) {
                    fileProblems.push({
                        elemento: `Script "${scriptSrc}"`,
                        problema: 'Arquivo de script não encontrado',
                        sugestao: 'Verificar caminho do script ou criar o arquivo'
                    });
                }
            }
        });
        
        // Se houver problemas, adicionar ao objeto de problemas
        if (fileProblems.length > 0) {
            problemas[filename] = fileProblems;
        }
        
    } catch (error) {
        console.error(`Erro ao analisar ${filename}:`, error);
        problemas[filename] = [{
            elemento: 'Arquivo completo',
            problema: `Erro ao analisar: ${error.message}`,
            sugestao: 'Verificar sintaxe HTML'
        }];
    }
});

// Exibir resultados
console.log('\n===== RELATÓRIO DE VERIFICAÇÃO DE BOTÕES =====\n');

const totalProblemas = Object.values(problemas).reduce((total, fileProblems) => 
    total + fileProblems.length, 0);

const arquivosComProblemas = Object.keys(problemas).length;
const totalArquivos = htmlFiles.length;

console.log(`Encontrados ${totalProblemas} problemas em ${arquivosComProblemas} de ${totalArquivos} arquivos.\n`);

if (totalProblemas > 0) {
    console.log('DETALHES DOS PROBLEMAS ENCONTRADOS:');
    console.log('==================================\n');
    
    Object.keys(problemas).forEach(filename => {
        console.log(`\x1b[1m${filename}\x1b[0m:`);
        
        problemas[filename].forEach(problema => {
            console.log(`  • \x1b[33m${problema.elemento}\x1b[0m: ${problema.problema}`);
            console.log(`    \x1b[32mSugestão:\x1b[0m ${problema.sugestao}`);
        });
        
        console.log(''); // Linha em branco
    });
} else {
    console.log('Nenhum problema encontrado! Todos os botões parecem estar corretos.');
}

console.log('\nVerificação concluída!');
