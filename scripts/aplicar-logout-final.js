const fs = require('fs');
const path = require('path');

// Diretório das páginas HTML
const pagesDir = path.join(__dirname, '..', 'public');
const jsDir = path.join(pagesDir, 'js');

// Lista de páginas que não precisam de verificação
const publicPages = ['login.html', 'cadastro.html', 'index.html'];

// Salva o script logout-final.js
const logoutFinalContent = `// Solução final para o problema de logout
document.addEventListener('DOMContentLoaded', function() {
    // Configuração
    const DEBUG = true;
    
    // Função de log condicional
    function log(message) {
        if (DEBUG) console.log('[LOGOUT]', message);
    }
    
    // Função que realiza o logout
    function realizarLogout(event) {
        if (event) event.preventDefault();
        log('Executando logout');
        
        try {
            // Limpa o localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('usuario');
            log('LocalStorage limpo');
            
            // Limpa os cookies se existirem
            document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            log('Cookies limpos');
            
            // Redireciona para página de login
            window.location.href = '/login.html';
        } catch (erro) {
            console.error('Erro ao fazer logout:', erro);
        }
    }
    
    // Torna a função global
    window.realizarLogout = realizarLogout;
    
    // Encontra o botão de logout
    const botaoSair = document.getElementById('botao-sair');
    if (botaoSair) {
        log('Botão de logout encontrado com ID "botao-sair"');
        botaoSair.addEventListener('click', realizarLogout);
    } else {
        log('Procurando botão de logout por texto...');
        // Procura por links com texto "Sair"
        let encontrado = false;
        document.querySelectorAll('a').forEach(link => {
            if (link.textContent.trim() === 'Sair') {
                log('Link de Sair encontrado pelo texto');
                link.addEventListener('click', realizarLogout);
                encontrado = true;
            }
        });
        
        if (!encontrado) {
            log('ERRO: Nenhum link de logout encontrado');
        }
    }
    
    log('Inicialização completa');
});`;

fs.writeFileSync(path.join(jsDir, 'logout-final.js'), logoutFinalContent);
console.log('Script logout-final.js criado com sucesso');

// Função para aplicar o script a todas as páginas
function aplicarLogoutFinal() {
    // Obtém a lista de arquivos HTML
    const files = fs.readdirSync(pagesDir).filter(file => 
        file.endsWith('.html') && !publicPages.includes(file)
    );

    console.log(`Encontradas ${files.length} páginas para aplicar logout final`);

    // Para cada arquivo, aplica o script
    files.forEach(file => {
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 1. Substituir o link de logout em menus suspensos
        if (content.includes('<div class="dropdown-content">')) {
            const dropdownRegex = /<div class="dropdown-content">[\s\S]*?<a[^>]*>(Sair)<\/a>[\s\S]*?<\/div>/g;
            if (!content.includes('id="botao-sair"')) {
                content = content.replace(dropdownRegex, '<div class="dropdown-content">\n            <a href="#" id="botao-sair">Sair</a>\n        </div>');
                modified = true;
            }
        }

        // 2. Remover scripts antigos de logout
        const scriptTags = [
            '<script src="js/global-logout.js"></script>',
            '<script src="js/logout-debug.js"></script>',
            '<script src="js/simple-logout.js"></script>',
            '<script src="js/logout-test.js"></script>'
        ];

        scriptTags.forEach(tag => {
            if (content.includes(tag)) {
                content = content.replace(tag, '');
                modified = true;
            }
        });

        // 3. Adicionar o script final se não existir
        if (!content.includes('logout-final.js')) {
            content = content.replace(/<\/head>/, '<script src="js/logout-final.js"></script>\n</head>');
            modified = true;
        }

        // 4. Remover código javascript antigo relacionado ao logout
        const oldLogoutCode = /document\.addEventListener\('DOMContentLoaded', function\(\) \{\s*const logoutBtn = document\.getElementById\([^\)]+\);\s*if \(logoutBtn\) \{\s*logoutBtn\.addEventListener\('click'[^\}]+\}\s*\}\);/g;
        if (content.match(oldLogoutCode)) {
            content = content.replace(oldLogoutCode, '');
            modified = true;
        }

        // Se o conteúdo foi modificado, salva o arquivo
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Script de logout final aplicado em ${file}`);
        } else {
            console.log(`Nenhuma modificação necessária em ${file}`);
        }
    });

    console.log('Processo concluído!');
}

// Executa a função
aplicarLogoutFinal();
