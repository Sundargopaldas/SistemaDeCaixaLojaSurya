const fs = require('fs');
const path = require('path');

// Diretório das páginas HTML
const pagesDir = path.join(__dirname, '..', 'public');

// Lista de páginas que não precisam de verificação
const publicPages = ['login.html', 'cadastro.html', 'index.html'];

// Função para remover botões de logout adicionados anteriormente
function removeLogoutButtons() {
    // Obtém a lista de arquivos HTML
    const files = fs.readdirSync(pagesDir).filter(file => 
        file.endsWith('.html') && !publicPages.includes(file)
    );

    console.log(`Encontradas ${files.length} páginas para remover botões de logout`);

    // Para cada arquivo, remove o botão de logout
    files.forEach(file => {
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Padrões para encontrar botões de logout
        const patterns = [
            /<button id="btn-logout".*?Sair<\/button>/g,
            /<button id="logout-btn".*?Sair<\/button>/g,
            /<div class="nav-item ml-auto">.*?<button id="logout-btn".*?Sair<\/button>.*?<\/div>/g,
            /<div class="nav-item ml-auto">.*?<button id="btn-logout".*?Sair<\/button>.*?<\/div>/g
        ];

        // Tenta cada padrão
        patterns.forEach(pattern => {
            if (pattern.test(content)) {
                content = content.replace(pattern, '');
                modified = true;
            }
        });

        // Se o conteúdo foi modificado, salva o arquivo
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Botão de logout removido de ${file}`);
        } else {
            console.log(`Nenhum botão de logout encontrado em ${file}`);
        }
    });

    console.log('Processo concluído!');
}

// Preservar a funcionalidade de logout no código JavaScript
function preserveLogoutFunction() {
    // Caminho para o arquivo auth.js
    const authJsPath = path.join(__dirname, '..', 'public', 'js', 'auth.js');
    
    if (fs.existsSync(authJsPath)) {
        let content = fs.readFileSync(authJsPath, 'utf8');
        
        // Remover a parte que adiciona evento ao botão de logout
        if (content.includes('document.addEventListener(\'DOMContentLoaded\', function() {')) {
            content = content.replace(/document\.addEventListener\('DOMContentLoaded', function\(\) \{\s*const logoutBtn = document\.getElementById\('btn-logout'\) \|\| document\.getElementById\('logout-btn'\);\s*if \(logoutBtn\) \{\s*logoutBtn\.addEventListener\('click', fazerLogout\);\s*\}\s*\}\);/g, 
            '// Função de logout pode ser chamada programaticamente quando necessário');
            
            fs.writeFileSync(authJsPath, content);
            console.log('Removido o código que adiciona evento ao botão de logout de auth.js');
        }
    }
}

// Executa a função
removeLogoutButtons();
preserveLogoutFunction();
