/**
 * Script para atualizar automaticamente a navbar em todas as páginas HTML do PDV-Surya
 * Versão: 1.1 - Melhorada para garantir compatibilidade com o HTML existente
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Diretório público com as páginas HTML
const publicDir = path.join(__dirname, '..', 'public');

// Modelo de navbar para inserir em todas as páginas
const modeloNavbar = `
<div class="nav-menu">
    <a href="index.html">Início</a>
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

// Função para verificar se um arquivo é HTML
function isHtmlFile(filename) {
    return path.extname(filename).toLowerCase() === '.html';
}

// Função para atualizar a navbar de uma página HTML
function atualizarNavbar(filePath) {
    console.log(`Atualizando navbar em: ${filePath}`);
    
    try {
        // Ler o conteúdo do arquivo
        let html = fs.readFileSync(filePath, 'utf8');
        
        // Carregar o HTML usando Cheerio
        const $ = cheerio.load(html, { decodeEntities: false });
        
        // Verificar se já tem o link para o CSS da navbar
        if (!$('link[href="css/navbar.css"]').length) {
            $('head').append('<link rel="stylesheet" href="css/navbar.css">');
            console.log('- Adicionado link para navbar.css');
        }
        
        // Verificar se já tem o script da navbar
        if (!$('script[src="js/navbar.js"]').length) {
            $('body').append('<script src="js/navbar.js"></script>');
            console.log('- Adicionado script navbar.js');
        }
        
        // Remover qualquer navbar existente
        const navbarExistente = $('.nav-menu');
        if (navbarExistente.length > 0) {
            console.log('- Removendo navbar existente');
            navbarExistente.remove();
        }
        
        // Identificar o local ideal para inserir a navbar
        // Tentar inserir após o tag <body>
        if ($('body').length > 0) {
            // Obter o nome do arquivo atual para destacar o link correto
            const filename = path.basename(filePath);
            
            // Criar o HTML da navbar com o link ativo
            let navbarHtml = modeloNavbar;
            
            // Inserir a navbar no início do body
            $('body').prepend(navbarHtml);
            
            console.log('- Navbar inserida no início do body');
        } else {
            console.error('- Não foi possível encontrar o elemento body');
            return;
        }
        
        // Salvar as mudanças
        fs.writeFileSync(filePath, $.html());
        console.log(`✅ Navbar atualizada em: ${path.basename(filePath)}`);
    } catch (error) {
        console.error(`❌ Erro ao atualizar ${path.basename(filePath)}: ${error.message}`);
    }
}

// Função principal que processa todos os arquivos HTML
function processarArquivosHtml() {
    // Verificar se o diretório público existe
    if (!fs.existsSync(publicDir)) {
        console.error(`❌ Diretório não encontrado: ${publicDir}`);
        return;
    }
    
    // Criar diretório CSS se não existir
    const cssDir = path.join(publicDir, 'css');
    if (!fs.existsSync(cssDir)) {
        fs.mkdirSync(cssDir);
        console.log('Diretório CSS criado');
    }
    
    // Criar diretório JS se não existir
    const jsDir = path.join(publicDir, 'js');
    if (!fs.existsSync(jsDir)) {
        fs.mkdirSync(jsDir);
        console.log('Diretório JS criado');
    }
    
    // Ler todos os arquivos do diretório
    const arquivos = fs.readdirSync(publicDir);
    
    // Filtrar apenas arquivos HTML
    const arquivosHtml = arquivos.filter(isHtmlFile);
    
    console.log(`Encontrados ${arquivosHtml.length} arquivos HTML para atualizar...`);
    
    // Processar cada arquivo HTML
    arquivosHtml.forEach(arquivo => {
        const filePath = path.join(publicDir, arquivo);
        atualizarNavbar(filePath);
    });
    
    console.log('\nProcessamento concluído! 🎉');
    console.log('\nSe encontrar problemas com a exibição da navbar, adicione manualmente estas linhas:');
    console.log('\n1. No <head> da página: <link rel="stylesheet" href="css/navbar.css">');
    console.log('\n2. No final do <body>: <script src="js/navbar.js"></script>');
}

// Executar o script
processarArquivosHtml();
