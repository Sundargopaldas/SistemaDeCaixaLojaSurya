/**
 * corrigir-navbar.js - Script para corrigir a implementação da navbar
 * 
 * Este script corrige os problemas de implementação da navbar padronizada,
 * especialmente o problema de destaque azul da página atual.
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configurações
const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const cssDir = path.join(publicDir, 'css');
const jsDir = path.join(publicDir, 'js');

// Checar se os diretórios necessários existem
if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
    console.log('Diretório CSS criado');
}

if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
    console.log('Diretório JS criado');
}

// Conteúdo da navbar padronizada
const navbarHtml = `
<div class="nav-menu">
    <a href="caixa.html">Caixa</a>
    <a href="produtos.html">Produtos</a>
    <a href="produtoLista.html">Lista de Produtos</a>
    <a href="historico.html">Histórico</a>
    <a href="despesas.html">Despesas</a>
    <a href="contasPagar.html">Contas a Pagar</a>
    <a href="listaDeClientes.html">Clientes</a>
    <a href="listaDeFornecedores.html">Fornecedores</a>
    <a href="orcamentos.html">Orçamentos</a>
    <a href="dashboard.html">Dashboard</a>
    <a href="relatorios.html">Relatórios</a>
    <div class="user-menu">
        <div class="user-icon">U</div>
        <div class="dropdown-content">
            <a href="#" id="botao-sair">Sair</a>
        </div>
    </div>
</div>
`;

// Atualizar o arquivo navbar.js
function updateNavbarJs() {
    const navbarJsPath = path.join(jsDir, 'navbar.js');
    const jsContent = `/**
 * navbar.js - Funcionalidades para a navbar padronizada do PDV-Surya
 * Versão: 1.2 - Corrigida para destacar corretamente a página atual
 */

// Função para destacar o link ativo na navbar
function highlightActiveLink() {
    try {
        // Obter a URL atual
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop().toLowerCase() || 'index.html';
        
        console.log('Página atual:', pageName);
        
        // Verificar se devemos processar
        if (!document.querySelector('.nav-menu')) {
            console.error('Navbar não encontrada!');
            return;
        }
        
        // Selecionar todos os links da navbar
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        // Remover qualquer destaque existente
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.classList.remove('highlight-nav');
        });
        
        // Marcar como ativo o link atual
        let found = false;
        navLinks.forEach(link => {
            if (!link.getAttribute('href')) return;
            
            const linkHref = link.getAttribute('href').toLowerCase();
            
            // Ignorar o link de logout
            if (link.id === 'botao-sair') return;
            
            // Verificar correspondência
            if (
                (pageName === linkHref) || 
                (linkHref === pageName) ||
                (currentPath.endsWith(linkHref)) ||
                (pageName === 'index.html' && linkHref === 'caixa.html') || // Destaca "Caixa" quando estiver na página inicial
                (linkHref !== 'index.html' && pageName.includes(linkHref.replace('.html', '')))
            ) {
                console.log('Link ativo encontrado:', linkHref);
                link.classList.add('active');
                found = true;
            }
        });
        
        // Se não encontrou correspondência exata, verificar por palavra-chave
        if (!found && pageName) {
            const pageNameWithoutExt = pageName.replace('.html', '');
            
            // Tratamento especial para dashboard
            if (pageNameWithoutExt === 'dashboard') {
                const dashboardLink = Array.from(navLinks).find(link => 
                    link.getAttribute('href') && 
                    link.getAttribute('href').toLowerCase() === 'dashboard.html');
                
                if (dashboardLink) {
                    dashboardLink.classList.add('active');
                    found = true;
                }
            }
            
            // Tratamento especial para index/home
            if (pageNameWithoutExt === 'index' || pageNameWithoutExt === '') {
                const caixaLink = Array.from(navLinks).find(link => 
                    link.getAttribute('href') && 
                    link.getAttribute('href').toLowerCase() === 'caixa.html');
                
                if (caixaLink) {
                    caixaLink.classList.add('active');
                    found = true;
                }
            }
            
            // Tratamento para outras páginas por correspondência parcial
            if (!found) {
                navLinks.forEach(link => {
                    if (!link.getAttribute('href')) return;
                    if (link.id === 'botao-sair') return;
                    
                    const linkText = link.textContent.toLowerCase();
                    const linkHref = link.getAttribute('href').toLowerCase().replace('.html', '');
                    
                    if (pageNameWithoutExt.includes(linkHref) || linkHref.includes(pageNameWithoutExt)) {
                        console.log('Link ativo por correspondência parcial:', linkHref);
                        link.classList.add('active');
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Erro ao destacar link ativo:', error);
    }
}

// Aplicar estilo quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Destacar o link ativo
    highlightActiveLink();
    
    // Confirmar que temos a margem superior correta
    if (document.body.style.marginTop === "" && 
        document.body.style.paddingTop === "" &&
        !document.querySelector('main.main-content')) {
        
        document.body.style.marginTop = '70px';
    }
});

// Se a página já foi carregada, executar imediatamente
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    highlightActiveLink();
}
`;

    fs.writeFileSync(navbarJsPath, jsContent);
    console.log('✓ Arquivo navbar.js atualizado');
}

// Processar um arquivo HTML
function processHtmlFile(filePath) {
    try {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(htmlContent);
        const fileName = path.basename(filePath);
        
        console.log(`\n🔍 Processando: ${fileName}`);
        
        // Verificar se já tem o link para o CSS da navbar
        let hasNavbarCss = $('link[href="css/navbar.css"]').length > 0;
        
        // Verificar se já tem o script da navbar
        let hasNavbarJs = $('script[src="js/navbar.js"]').length > 0;
        
        // Garantir que o CSS da navbar seja o primeiro no head
        if (!hasNavbarCss) {
            $('head').prepend('<link rel="stylesheet" href="css/navbar.css">');
            console.log('✓ Adicionado link para CSS da navbar');
        } else {
            // Mover para o início do head se não for o primeiro
            const navbarCssLink = $('link[href="css/navbar.css"]');
            if ($('head link').first().attr('href') !== 'css/navbar.css') {
                navbarCssLink.remove();
                $('head').prepend('<link rel="stylesheet" href="css/navbar.css">');
                console.log('✓ Movido CSS da navbar para o início do head');
            }
        }
        
        // Remover estilos internos que possam conflitar com a navbar
        $('style').each((i, elem) => {
            const styleContent = $(elem).html();
            if (styleContent.includes('.nav-menu') || 
                styleContent.includes('.user-menu') || 
                styleContent.includes('.dropdown-content')) {
                
                const newStyleContent = styleContent
                    .replace(/\.nav-menu\s*\{[^}]*\}/g, '')
                    .replace(/\.nav-menu [^{]*\{[^}]*\}/g, '')
                    .replace(/\.user-menu\s*\{[^}]*\}/g, '')
                    .replace(/\.dropdown-content\s*\{[^}]*\}/g, '');
                
                $(elem).html(newStyleContent);
                console.log('✓ Removidos estilos da navbar do HTML');
            }
        });
        
        // Substituir ou adicionar a navbar
        const existingNavbar = $('.nav-menu');
        if (existingNavbar.length > 0) {
            existingNavbar.replaceWith(navbarHtml);
            console.log('✓ Substituída navbar existente');
        } else {
            // Adicionar a navbar após a abertura do body
            $('body').prepend(navbarHtml);
            console.log('✓ Adicionada nova navbar');
        }
        
        // Adicionar margin-top ao primeiro elemento após a navbar se necessário
        const mainContent = $('body > *:not(.nav-menu):not(script):not(style):not(link):first');
        if (mainContent.length > 0 && 
            !mainContent.attr('style')?.includes('margin-top') && 
            !mainContent.hasClass('main-content')) {
            
            mainContent.attr('style', 
                (mainContent.attr('style') || '') + '; margin-top: 70px !important;');
            console.log('✓ Adicionada margem superior ao conteúdo principal');
        }
        
        // Adicionar o script da navbar no final do body
        if (!hasNavbarJs) {
            $('body').append('<script src="js/navbar.js"></script>');
            console.log('✓ Adicionado script da navbar');
        }
        
        // Salvar as alterações
        fs.writeFileSync(filePath, $.html());
        console.log(`✅ Arquivo ${fileName} atualizado com sucesso!`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao processar ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

// Encontrar e processar arquivos HTML
function processDirectory() {
    try {
        const files = fs.readdirSync(publicDir);
        let processedCount = 0;
        let errorCount = 0;
        
        console.log('🔄 Iniciando processamento de arquivos HTML...\n');
        
        // Primeiro atualizar o arquivo navbar.js
        updateNavbarJs();
        
        // Processar arquivos HTML
        for (const file of files) {
            if (file.endsWith('.html')) {
                const filePath = path.join(publicDir, file);
                const success = processHtmlFile(filePath);
                
                if (success) {
                    processedCount++;
                } else {
                    errorCount++;
                }
            }
        }
        
        console.log(`\n✅ Processamento concluído!`);
        console.log(`📊 Resumo:`);
        console.log(`   - Arquivos processados com sucesso: ${processedCount}`);
        console.log(`   - Arquivos com erro: ${errorCount}`);
        
    } catch (error) {
        console.error('❌ Erro ao processar diretório:', error.message);
    }
}

// Iniciar o processamento
try {
    if (!fs.existsSync(path.join(publicDir))) {
        console.error('❌ Diretório public/ não encontrado!');
        process.exit(1);
    }
    
    // Verificar se cheerio está instalado
    try {
        require('cheerio');
    } catch (err) {
        console.error('❌ Dependência não encontrada: cheerio');
        console.error('   Por favor, execute: npm install cheerio');
        process.exit(1);
    }
    
    processDirectory();
} catch (error) {
    console.error('❌ Erro fatal:', error.message);
}
