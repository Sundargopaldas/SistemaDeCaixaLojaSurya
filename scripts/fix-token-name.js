const fs = require('fs');
const path = require('path');

// Diretório dos arquivos JavaScript
const jsDir = path.join(__dirname, '..', 'public', 'js');

// Lista de arquivos que não precisam de verificação
const excludeFiles = ['login.js', 'auth.js']; // Estes já foram verificados manualmente

// Função para corrigir o nome do token em todos os arquivos
function fixTokenName() {
    // Obtém a lista de arquivos JS
    const files = fs.readdirSync(jsDir).filter(file => 
        file.endsWith('.js') && !excludeFiles.includes(file)
    );

    console.log(`Encontrados ${files.length} arquivos JS para verificar e corrigir`);

    // Para cada arquivo, verifica se há referências a 'token' e substitui por 'authToken'
    files.forEach(file => {
        const filePath = path.join(jsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Verifica usos de localStorage
        if (content.includes('localStorage.getItem(\'token\')')) {
            content = content.replace(/localStorage\.getItem\('token'\)/g, 'localStorage.getItem(\'authToken\')');
            modified = true;
        }

        if (content.includes('localStorage.setItem(\'token\'')) {
            content = content.replace(/localStorage\.setItem\('token'/g, 'localStorage.setItem(\'authToken\'');
            modified = true;
        }

        if (content.includes('localStorage.removeItem(\'token\')')) {
            content = content.replace(/localStorage\.removeItem\('token'\)/g, 'localStorage.removeItem(\'authToken\')');
            modified = true;
        }

        // Verifica se já está usando authToken
        if (content.includes('authToken')) {
            console.log(`${file} já usa 'authToken' em algum lugar`);
        }

        // Se o conteúdo foi modificado, salva o arquivo
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Corrigido ${file}`);
        } else {
            console.log(`Nenhuma correção necessária em ${file}`);
        }
    });

    console.log('Processo concluído!');
}

// Executa a função
fixTokenName();
