const fs = require('fs');
const path = require('path');

// Diretório das páginas HTML
const pagesDir = path.join(__dirname, '..', 'public');

// Lista de páginas que não precisam de verificação
const publicPages = ['login.html', 'cadastro.html', 'index.html'];

// Função para otimizar a carga de scripts
function otimizarScripts() {
    // Obtém a lista de arquivos HTML
    const files = fs.readdirSync(pagesDir).filter(file => 
        file.endsWith('.html') && !publicPages.includes(file)
    );

    console.log(`Encontradas ${files.length} páginas para otimizar scripts`);

    // Para cada arquivo, otimiza os scripts
    files.forEach(file => {
        const filePath = path.join(pagesDir, file);
        const fileBaseName = path.basename(file, '.html');
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Script principal específico para cada página
        const mainScriptRegex = new RegExp(`<script src="js\/${fileBaseName}.js"><\/script>`, 'g');
        
        if (content.match(mainScriptRegex)) {
            content = content.replace(mainScriptRegex, `<script src="js/${fileBaseName}.js" defer></script>`);
            modified = true;
        }

        // Se o conteúdo foi modificado, salva o arquivo
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Scripts otimizados em ${file}`);
        } else {
            console.log(`Nenhuma otimização necessária em ${file}`);
        }
    });

    console.log('Processo concluído!');
}

// Executa a função
otimizarScripts();
