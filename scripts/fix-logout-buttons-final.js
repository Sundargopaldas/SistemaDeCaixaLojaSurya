const fs = require('fs');
const path = require('path');

// Diretório das páginas HTML
const pagesDir = path.join(__dirname, '..', 'public');

// Lista de páginas que não precisam de verificação
const publicPages = ['login.html', 'cadastro.html', 'index.html'];

// Função para corrigir os botões de logout
function fixLogoutButtons() {
    // Obtém a lista de arquivos HTML
    const files = fs.readdirSync(pagesDir).filter(file => 
        file.endsWith('.html') && !publicPages.includes(file)
    );

    console.log(`Encontradas ${files.length} páginas para corrigir botões de logout`);

    // Para cada arquivo, corrige os botões de logout
    files.forEach(file => {
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 1. Substituir o link de logout em menus suspensos
        if (content.includes('<div class="dropdown-content">')) {
            const dropdownRegex = /<div class="dropdown-content">[\s\S]*?<a[^>]*>(Sair)<\/a>[\s\S]*?<\/div>/g;
            content = content.replace(dropdownRegex, '<div class="dropdown-content">\n            <a href="#" id="botao-sair">Sair</a>\n        </div>');
            modified = true;
        }

        // 2. Adicionar script simple-logout.js se ainda não existir
        if (!content.includes('simple-logout.js')) {
            content = content.replace(/<\/head>/, '<script src="js/simple-logout.js"></script>\n</head>');
            modified = true;
        }

        // 3. Remover qualquer código JavaScript antigo para logout no final do arquivo
        const oldLogoutCode = /document\.addEventListener\('DOMContentLoaded', function\(\) \{\s*const logoutBtn = document\.getElementById\('btn-logout'\) \|\| document\.getElementById\('logout-btn'\) \|\| document\.getElementById\('botao-sair'\);\s*if \(logoutBtn\) \{\s*logoutBtn\.addEventListener\('click', fazerLogout\);\s*\}\s*\}\);/g;
        if (content.match(oldLogoutCode)) {
            content = content.replace(oldLogoutCode, '');
            modified = true;
        }

        // Se o conteúdo foi modificado, salva o arquivo
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Botões de logout corrigidos em ${file}`);
        } else {
            console.log(`Nenhuma correção necessária em ${file}`);
        }
    });

    console.log('Processo concluído!');
}

// Função para criar/atualizar o arquivo simple-logout.js
function createSimpleLogoutScript() {
    const filePath = path.join(__dirname, '..', 'public', 'js', 'simple-logout.js');
    const scriptContent = `// Script simples para garantir o funcionamento do logout
document.addEventListener('DOMContentLoaded', function() {
    // Função de logout direta
    function executarLogout() {
        console.log('Executando logout simples');
        
        // Remove dados do localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        
        // Redireciona para a página de login
        window.location.href = '/login.html';
    }
    
    // Procura pelo botão específico de logout
    const botaoSair = document.getElementById('botao-sair');
    if (botaoSair) {
        console.log('Botão de sair encontrado pelo ID');
        
        // Adiciona o evento de clique
        botaoSair.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Clique no botão de sair detectado');
            executarLogout();
        });
    } else {
        console.log('Botão de sair não encontrado pelo ID, procurando por texto');
        
        // Alternativa: procura por links com texto "Sair"
        const links = document.querySelectorAll('a');
        let encontrado = false;
        
        links.forEach(link => {
            if (link.textContent.trim() === 'Sair') {
                console.log('Link de Sair encontrado pelo texto:', link);
                encontrado = true;
                
                // Adiciona o evento de clique
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Clique em Sair detectado');
                    executarLogout();
                });
            }
        });
        
        if (!encontrado) {
            console.error('Nenhum link de logout encontrado na página');
        }
    }
    
    console.log('Script de logout simples inicializado');
});`;

    fs.writeFileSync(filePath, scriptContent);
    console.log('Arquivo simple-logout.js criado/atualizado com sucesso!');
}

// Executa as funções
createSimpleLogoutScript();
fixLogoutButtons();
