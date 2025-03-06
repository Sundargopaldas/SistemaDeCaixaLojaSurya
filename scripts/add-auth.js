const fs = require('fs');
const path = require('path');

// Diretório das páginas HTML
const pagesDir = path.join(__dirname, '..', 'public');

// Lista de páginas que não precisam de autenticação
const publicPages = ['login.html', 'cadastro.html', 'index.html'];

// Adiciona o script de autenticação a todas as páginas HTML protegidas
function addAuthToProtectedPages() {
    // Obtém a lista de arquivos HTML
    const files = fs.readdirSync(pagesDir).filter(file => 
        file.endsWith('.html') && !publicPages.includes(file)
    );

    console.log(`Encontradas ${files.length} páginas protegidas para adicionar autenticação`);

    // Para cada arquivo, adiciona o script de autenticação
    files.forEach(file => {
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Verifica se já tem o script de autenticação
        if (content.includes('auth.js')) {
            console.log(`${file} já possui o script de autenticação.`);
            return;
        }

        // Adiciona o script de autenticação antes do </head>
        if (content.includes('</head>')) {
            content = content.replace('</head>', '    <script src="js/auth.js"></script>\n</head>');
            fs.writeFileSync(filePath, content);
            console.log(`Autenticação adicionada a ${file}`);
        } else {
            console.log(`ERRO: ${file} não possui a tag </head>`);
        }
    });

    console.log('Processo concluído!');
}

// Executa a função
addAuthToProtectedPages();
