/**
 * Diagnóstico de Implementação da Navbar
 * 
 * Este script analisa a implementação da navbar padronizada nos
 * arquivos HTML e identifica possíveis problemas ou conflitos.
 * 
 * Uso: node scripts/diagnostico-navbar.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Diretório raiz
const publicDir = path.join(__dirname, '..', 'public');

// Arquivos a analisar
const arquivosHtml = [];

// Cores para console
const cores = {
    vermelho: '\x1b[31m',
    verde: '\x1b[32m',
    amarelo: '\x1b[33m',
    azul: '\x1b[34m',
    reset: '\x1b[0m',
    negrito: '\x1b[1m'
};

// Verificar se o Cheerio está instalado
try {
    require('cheerio');
    console.log(`${cores.verde}✓ Cheerio encontrado. Continuando...${cores.reset}\n`);
} catch (err) {
    console.error(`${cores.vermelho}✖ Cheerio não encontrado. Instale com: npm install cheerio${cores.reset}`);
    process.exit(1);
}

// Encontrar todos os arquivos HTML
function encontrarArquivosHtml(dir) {
    const arquivos = fs.readdirSync(dir);
    
    for (const arquivo of arquivos) {
        const caminhoCompleto = path.join(dir, arquivo);
        const stat = fs.statSync(caminhoCompleto);
        
        if (stat.isDirectory()) {
            encontrarArquivosHtml(caminhoCompleto);
        } else if (arquivo.endsWith('.html')) {
            arquivosHtml.push(caminhoCompleto);
        }
    }
}

// Analisar um arquivo HTML
function analisarArquivo(arquivo) {
    const conteudo = fs.readFileSync(arquivo, 'utf8');
    const $ = cheerio.load(conteudo);
    const nomeArquivo = path.basename(arquivo);
    const resultados = {
        arquivo: nomeArquivo,
        problemas: [],
        status: 'ok'
    };
    
    console.log(`${cores.negrito}Analisando: ${nomeArquivo}${cores.reset}`);
    
    // Verificar se tem o CSS da navbar
    const temCssNavbar = $('link[href="css/navbar.css"]').length > 0;
    
    if (!temCssNavbar) {
        resultados.problemas.push('CSS da navbar não encontrado');
        resultados.status = 'problema';
        console.log(`${cores.vermelho}✖ CSS da navbar não encontrado${cores.reset}`);
    } else {
        console.log(`${cores.verde}✓ CSS da navbar encontrado${cores.reset}`);
        
        // Verificar se o CSS da navbar vem antes dos outros CSS
        const linksCss = $('link[rel="stylesheet"]');
        let indexNavbarCss = -1;
        
        linksCss.each((index, element) => {
            if ($(element).attr('href') === 'css/navbar.css') {
                indexNavbarCss = index;
            }
        });
        
        if (indexNavbarCss > 0) {
            resultados.problemas.push('CSS da navbar não é o primeiro CSS');
            resultados.status = 'aviso';
            console.log(`${cores.amarelo}⚠ CSS da navbar não é o primeiro CSS${cores.reset}`);
        }
    }
    
    // Verificar se tem a navbar
    const temNavbar = $('.nav-menu').length > 0;
    
    if (!temNavbar) {
        resultados.problemas.push('Navbar padronizada não encontrada');
        resultados.status = 'problema';
        console.log(`${cores.vermelho}✖ Navbar padronizada não encontrada${cores.reset}`);
    } else {
        console.log(`${cores.verde}✓ Navbar padronizada encontrada${cores.reset}`);
        
        // Verificar se a navbar tem todos os links padrão
        const linksEsperados = ['index.html', 'caixa.html', 'produtos.html', 'produtoLista.html', 
                                'historico.html', 'despesas.html', 'contasPagar.html',
                                'listaDeClientes.html', 'listaDeFornecedores.html', 
                                'orcamentos.html', 'dashboard.html', 'relatorios.html'];
        
        const linksEncontrados = [];
        $('.nav-menu a').each((index, element) => {
            const href = $(element).attr('href');
            if (href && !href.startsWith('#') && href !== '#' && href !== "#botao-sair") {
                linksEncontrados.push(href);
            }
        });
        
        const linksFaltantes = linksEsperados.filter(link => !linksEncontrados.includes(link));
        
        if (linksFaltantes.length > 0) {
            resultados.problemas.push(`Links faltando na navbar: ${linksFaltantes.join(', ')}`);
            resultados.status = 'aviso';
            console.log(`${cores.amarelo}⚠ Links faltando na navbar: ${linksFaltantes.join(', ')}${cores.reset}`);
        }
        
        // Verificar se tem o botão de sair
        const temBotaoSair = $('#botao-sair').length > 0;
        
        if (!temBotaoSair) {
            resultados.problemas.push('Botão "Sair" não encontrado');
            resultados.status = 'aviso';
            console.log(`${cores.amarelo}⚠ Botão "Sair" não encontrado${cores.reset}`);
        }
    }
    
    // Verificar se tem o script da navbar
    const temScriptNavbar = $('script[src="js/navbar.js"]').length > 0;
    
    if (!temScriptNavbar) {
        resultados.problemas.push('Script da navbar não encontrado');
        resultados.status = 'problema';
        console.log(`${cores.vermelho}✖ Script da navbar não encontrado${cores.reset}`);
    } else {
        console.log(`${cores.verde}✓ Script da navbar encontrado${cores.reset}`);
    }
    
    // Verificar se tem margens para compensar a navbar
    let temMargemTopSuficiente = false;
    
    // Verificar inline style com margin-top
    $('[style*="margin-top"]').each((index, element) => {
        const style = $(element).attr('style');
        const match = style.match(/margin-top:\s*(\d+)px/);
        
        if (match && parseInt(match[1]) >= 60) {
            temMargemTopSuficiente = true;
        }
    });
    
    // Se não foi encontrado inline, verificar no primeiro elemento após a navbar
    if (!temMargemTopSuficiente) {
        const proximoElemento = $('.nav-menu').next();
        if (proximoElemento.length > 0) {
            const classeElemento = proximoElemento.attr('class');
            
            // Se tem alguma classe, podemos sugerir adicionar margem
            if (classeElemento) {
                resultados.problemas.push(`Sugestão: Adicionar margin-top ao elemento .${classeElemento}`);
                resultados.status = 'aviso';
                console.log(`${cores.amarelo}⚠ Sugestão: Adicionar margin-top ao elemento .${classeElemento}${cores.reset}`);
            }
        }
    }
    
    console.log(''); // Linha em branco para separar as análises
    return resultados;
}

// Função principal
function main() {
    console.log(`${cores.negrito}${cores.azul}Diagnóstico de Implementação da Navbar${cores.reset}\n`);
    
    // Verificar se public/ existe
    if (!fs.existsSync(publicDir)) {
        console.error(`${cores.vermelho}✖ Diretório public/ não encontrado${cores.reset}`);
        process.exit(1);
    }
    
    // Verificar se css/navbar.css existe
    const cssNavbarPath = path.join(publicDir, 'css', 'navbar.css');
    if (!fs.existsSync(cssNavbarPath)) {
        console.error(`${cores.vermelho}✖ Arquivo css/navbar.css não encontrado${cores.reset}`);
        process.exit(1);
    }
    
    // Verificar se js/navbar.js existe
    const jsNavbarPath = path.join(publicDir, 'js', 'navbar.js');
    if (!fs.existsSync(jsNavbarPath)) {
        console.error(`${cores.vermelho}✖ Arquivo js/navbar.js não encontrado${cores.reset}`);
        process.exit(1);
    }
    
    // Encontrar todos os arquivos HTML
    encontrarArquivosHtml(publicDir);
    
    if (arquivosHtml.length === 0) {
        console.error(`${cores.vermelho}✖ Nenhum arquivo HTML encontrado${cores.reset}`);
        process.exit(1);
    }
    
    console.log(`${cores.azul}Encontrados ${arquivosHtml.length} arquivos HTML para análise${cores.reset}\n`);
    
    // Analisar cada arquivo
    const resultados = [];
    
    for (const arquivo of arquivosHtml) {
        resultados.push(analisarArquivo(arquivo));
    }
    
    // Resumo
    console.log(`${cores.negrito}${cores.azul}Resumo da Análise${cores.reset}\n`);
    
    let problemasGraves = 0;
    let avisos = 0;
    let ok = 0;
    
    resultados.forEach(resultado => {
        if (resultado.status === 'problema') {
            problemasGraves++;
        } else if (resultado.status === 'aviso') {
            avisos++;
        } else {
            ok++;
        }
    });
    
    console.log(`${cores.verde}✓ ${ok} arquivos sem problemas${cores.reset}`);
    console.log(`${cores.amarelo}⚠ ${avisos} arquivos com avisos${cores.reset}`);
    console.log(`${cores.vermelho}✖ ${problemasGraves} arquivos com problemas graves${cores.reset}\n`);
    
    // Listar arquivos com problemas
    if (problemasGraves > 0) {
        console.log(`${cores.negrito}Arquivos com problemas graves:${cores.reset}`);
        resultados.filter(r => r.status === 'problema').forEach(r => {
            console.log(`${cores.vermelho}✖ ${r.arquivo}: ${r.problemas.join(', ')}${cores.reset}`);
        });
        console.log('');
    }
    
    if (avisos > 0) {
        console.log(`${cores.negrito}Arquivos com avisos:${cores.reset}`);
        resultados.filter(r => r.status === 'aviso').forEach(r => {
            console.log(`${cores.amarelo}⚠ ${r.arquivo}: ${r.problemas.join(', ')}${cores.reset}`);
        });
        console.log('');
    }
    
    console.log(`${cores.negrito}${cores.azul}Próximos passos:${cores.reset}`);
    console.log(`1. Corrija os problemas listados acima`);
    console.log(`2. Execute este diagnóstico novamente para verificar as correções`);
    console.log(`3. Teste manualmente cada página para garantir que a navbar esteja funcionando corretamente\n`);
}

// Executar
try {
    main();
} catch (err) {
    console.error(`${cores.vermelho}Erro ao executar o diagnóstico: ${err.message}${cores.reset}`);
    process.exit(1);
}
