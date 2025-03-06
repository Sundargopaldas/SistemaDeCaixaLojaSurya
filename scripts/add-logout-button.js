const fs = require('fs');
const path = require('path');

// Diretório das páginas HTML
const pagesDir = path.join(__dirname, '..', 'public');

// Lista de páginas que não precisam de botão de logout
const publicPages = ['login.html', 'cadastro.html', 'index.html'];

// Adiciona botão de logout a todas as páginas HTML protegidas
function addLogoutButton() {
    // Obtém a lista de arquivos HTML
    const files = fs.readdirSync(pagesDir).filter(file => 
        file.endsWith('.html') && !publicPages.includes(file)
    );

    console.log(`Encontradas ${files.length} páginas protegidas para adicionar botão de logout`);

    // Para cada arquivo, adiciona o botão de logout
    files.forEach(file => {
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Verifica se já tem o botão de logout
        if (content.includes('id="logout-btn"')) {
            console.log(`${file} já possui o botão de logout.`);
            return;
        }

        // Localiza o final da barra de navegação para adicionar o botão
        if (content.includes('</nav>')) {
            const logoutButton = `
            <div class="nav-item ml-auto">
                <button id="logout-btn" class="btn btn-outline-danger my-2 my-sm-0" type="button">Sair</button>
            </div>
            </nav>`;
            
            content = content.replace('</nav>', logoutButton);
            fs.writeFileSync(filePath, content);
            console.log(`Botão de logout adicionado a ${file}`);
        } else {
            console.log(`ERRO: ${file} não possui a tag </nav>`);
        }
    });

    console.log('Processo concluído!');
}

// Executa a função
addLogoutButton();
