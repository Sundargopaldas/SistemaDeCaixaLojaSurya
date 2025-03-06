/**
 * Script para verificar e corrigir botões de ação (editar, excluir, etc.) nas páginas de listagem
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Diretório que contém os arquivos HTML e CSS
const htmlDir = path.join(__dirname, '../public');
const cssDir = path.join(__dirname, '../public');

// Lista de páginas de listagem
const listagemFiles = [
    'listaDeClientes.html',
    'listaDeFornecedores.html',
    'listaOrcamentos.html',
    'produtoLista.html'
];

// CSS para botões de ação
const acaoBotoesCSS = `
/* Estilos para botões de ação em tabelas */
.btn-editar, .btn-excluir, .btn-visualizar, .btn-action {
    padding: 6px 12px;
    margin: 0 5px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    font-size: 0.9rem;
    transition: all 0.2s;
    text-decoration: none;
}

.btn-editar {
    background-color: #3498db;
    color: white;
}

.btn-editar:hover {
    background-color: #2980b9;
}

.btn-excluir {
    background-color: #e74c3c;
    color: white;
}

.btn-excluir:hover {
    background-color: #c0392b;
}

.btn-visualizar {
    background-color: #2ecc71;
    color: white;
}

.btn-visualizar:hover {
    background-color: #27ae60;
}

/* Adicionar ícones usando caracteres unicode */
.btn-editar::before {
    content: "✏️ ";
}

.btn-excluir::before {
    content: "🗑️ ";
}

.btn-visualizar::before {
    content: "👁️ ";
}

/* Estilos para células de ação */
.acoes {
    text-align: center;
    white-space: nowrap;
}

/* Garantir que botões em tabelas não quebrem linha */
table button, table .btn, table .btn-action {
    white-space: nowrap;
}
`;

// Estatísticas de correções
let totalCorrecoes = 0;
const estatisticas = {
    'adicionado_css_botoes': 0,
    'corrigido_classe_botoes': 0,
};

// Função para verificar se já existe CSS para botões de ação
function existeCSS(cssPath, cssContent) {
    if (!fs.existsSync(cssPath)) return false;
    
    const conteudoCSS = fs.readFileSync(cssPath, 'utf8');
    return conteudoCSS.includes('.btn-editar') && conteudoCSS.includes('.btn-excluir');
}

// Processar cada arquivo HTML de listagem
listagemFiles.forEach(filename => {
    try {
        const filePath = path.join(htmlDir, filename);
        
        // Verificar se o arquivo existe
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️ Arquivo não encontrado: ${filename}`);
            return;
        }
        
        const html = fs.readFileSync(filePath, 'utf8');
        let $ = cheerio.load(html);
        let modificado = false;
        
        // 1. Verificar se existe CSS para os botões de ação
        let cssFiles = [];
        $('link[rel="stylesheet"]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && href.endsWith('.css')) {
                cssFiles.push(href);
            }
        });
        
        // Nome base do arquivo sem a extensão
        const baseFileName = filename.replace('.html', '');
        
        // Verificar se existe CSS correspondente ao HTML
        const cssFileName = `${baseFileName}.css`;
        const cssFilePath = path.join(cssDir, cssFileName);
        
        // Se o CSS já existe, verificar se tem estilos para botões
        let temCSSBotoes = false;
        if (fs.existsSync(cssFilePath)) {
            temCSSBotoes = existeCSS(cssFilePath, acaoBotoesCSS);
        }
        
        // Se não tem CSS para botões, adicionar
        if (!temCSSBotoes) {
            // Se o arquivo CSS não existe, criar com os estilos
            if (!fs.existsSync(cssFilePath)) {
                fs.writeFileSync(cssFilePath, acaoBotoesCSS);
                
                // Adicionar referência ao CSS no HTML se não existir
                if (!cssFiles.includes(cssFileName)) {
                    $('head').append(`<link rel="stylesheet" href="${cssFileName}">`);
                    modificado = true;
                }
            } 
            // Se o arquivo CSS existe, apenas adicionar os estilos
            else {
                let cssConteudo = fs.readFileSync(cssFilePath, 'utf8');
                cssConteudo += '\n' + acaoBotoesCSS;
                fs.writeFileSync(cssFilePath, cssConteudo);
            }
            estatisticas.adicionado_css_botoes++;
        }
        
        // 2. Verificar e corrigir botões sem classes corretas
        $('button, a').each((i, elem) => {
            const elemento = $(elem);
            const text = elemento.text().trim().toLowerCase();
            
            // Adicionar classes aos botões baseado no texto
            if (text.includes('editar') && !elemento.hasClass('btn-editar')) {
                elemento.addClass('btn-editar');
                modificado = true;
                estatisticas.corrigido_classe_botoes++;
            }
            else if (text.includes('excluir') && !elemento.hasClass('btn-excluir')) {
                elemento.addClass('btn-excluir');
                modificado = true;
                estatisticas.corrigido_classe_botoes++;
            }
            else if (text.includes('visualizar') && !elemento.hasClass('btn-visualizar')) {
                elemento.addClass('btn-visualizar');
                modificado = true;
                estatisticas.corrigido_classe_botoes++;
            }
        });
        
        // 3. Verificar e corrigir células de ação sem classe apropriada
        $('td').each((i, elem) => {
            const elemento = $(elem);
            const conteudo = elemento.html();
            
            // Se contém botões de ação e não tem a classe .acoes
            if (conteudo && (conteudo.includes('btn-editar') || conteudo.includes('btn-excluir')) && !elemento.hasClass('acoes')) {
                elemento.addClass('acoes');
                modificado = true;
                estatisticas.corrigido_classe_botoes++;
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
console.log('\n===== RELATÓRIO DE CORREÇÕES DE BOTÕES DE AÇÃO =====\n');
console.log(`Total de arquivos processados: ${listagemFiles.length}`);
console.log(`Arquivos modificados: ${totalCorrecoes}`);
console.log('\nCorreções realizadas:');
console.log(`- CSS para botões de ação adicionados: ${estatisticas.adicionado_css_botoes}`);
console.log(`- Classes de botões corrigidas: ${estatisticas.corrigido_classe_botoes}`);

console.log('\nProcesso de correção de botões de ação concluído!');
