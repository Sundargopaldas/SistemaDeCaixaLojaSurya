const fs = require('fs');
const path = require('path');

// Diretório das páginas HTML
const pagesDir = path.join(__dirname, '..', 'public');

// Lista de páginas que não precisam de verificação
const publicPages = ['login.html', 'cadastro.html', 'index.html'];

// Função para adicionar o script de logout global a todas as páginas
function addGlobalLogout() {
    // Obtém a lista de arquivos HTML
    const files = fs.readdirSync(pagesDir).filter(file => 
        file.endsWith('.html') && !publicPages.includes(file)
    );

    console.log(`Encontradas ${files.length} páginas para adicionar script de logout global`);

    // Para cada arquivo, adiciona o script global-logout.js após auth.js
    files.forEach(file => {
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Verifica se auth.js já está incluído
        if (content.includes('auth.js') && !content.includes('global-logout.js')) {
            // Adiciona global-logout.js após auth.js
            content = content.replace(
                /<script src="js\/auth.js"><\/script>/,
                '<script src="js/auth.js"></script>\n    <script src="js/global-logout.js"></script>'
            );
            
            // Salva o arquivo modificado
            fs.writeFileSync(filePath, content);
            console.log(`Script global-logout.js adicionado em ${file}`);
        } else if (!content.includes('auth.js')) {
            console.log(`Arquivo ${file} não contém referência a auth.js`);
        } else if (content.includes('global-logout.js')) {
            console.log(`Arquivo ${file} já contém global-logout.js`);
        }
    });

    console.log('Processo concluído!');
}

// Executa a função
addGlobalLogout();
