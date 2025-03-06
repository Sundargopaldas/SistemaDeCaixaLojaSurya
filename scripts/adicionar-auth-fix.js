const fs = require('fs');
const path = require('path');

// Diretório das páginas HTML
const pagesDir = path.join(__dirname, '..', 'public');

// Lista de páginas que não precisam de verificação
const publicPages = ['login.html', 'cadastro.html', 'index.html'];

// Função para adicionar o script auth-fix.js a todas as páginas
function adicionarAuthFix() {
    // Obtém a lista de arquivos HTML
    const files = fs.readdirSync(pagesDir).filter(file => 
        file.endsWith('.html') && !publicPages.includes(file)
    );

    console.log(`Encontradas ${files.length} páginas para adicionar auth-fix.js`);

    // Para cada arquivo, adiciona o script auth-fix.js
    files.forEach(file => {
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Adicionar script auth-fix.js se ainda não existir
        if (!content.includes('auth-fix.js')) {
            content = content.replace(/<script src="js\/auth.js"><\/script>/, 
                '<script src="js/auth.js"></script>\n    <script src="js/auth-fix.js"></script>');
            modified = true;
        }

        // Se o conteúdo foi modificado, salva o arquivo
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Script auth-fix.js adicionado em ${file}`);
        } else {
            console.log(`Nenhuma alteração necessária em ${file}`);
        }
    });

    console.log('Processo concluído!');
}

// Executa a função
adicionarAuthFix();
