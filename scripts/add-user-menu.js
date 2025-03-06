const fs = require('fs');
const path = require('path');

// Diretório das páginas HTML
const pagesDir = path.join(__dirname, '..', 'public');

// Lista de páginas que não precisam de verificação
const publicPages = ['login.html', 'cadastro.html', 'index.html'];

// Estilo CSS a ser adicionado
const styleCSS = `
    <style>
        .user-menu {
            position: absolute;
            right: 20px;
            top: 10px;
            cursor: pointer;
        }
        .user-menu .user-icon {
            background-color: #3498db;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .dropdown-content {
            display: none;
            position: absolute;
            right: 0;
            background-color: #f9f9f9;
            min-width: 120px;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            z-index: 1;
            border-radius: 4px;
        }
        .user-menu:hover .dropdown-content {
            display: block;
        }
        .dropdown-content a {
            color: black;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            text-align: left;
        }
        .dropdown-content a:hover {
            background-color: #f1f1f1;
            border-radius: 4px;
        }
    </style>
`;

// HTML do menu de usuário
const userMenuHTML = `
    <div class="user-menu">
        <div class="user-icon">U</div>
        <div class="dropdown-content">
            <a href="javascript:void(0)" onclick="fazerLogout()">Sair</a>
        </div>
    </div>
`;

// Função para adicionar o menu de usuário em todas as páginas
function addUserMenu() {
    // Obtém a lista de arquivos HTML
    const files = fs.readdirSync(pagesDir).filter(file => 
        file.endsWith('.html') && !publicPages.includes(file) && file !== 'caixa.html' // Excluímos caixa.html pois já adicionamos manualmente
    );

    console.log(`Encontradas ${files.length} páginas para adicionar menu de usuário`);

    // Para cada arquivo, adiciona o menu de usuário
    files.forEach(file => {
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Adiciona o CSS se não existir
        if (!content.includes('user-menu')) {
            content = content.replace('</head>', `${styleCSS}\n</head>`);
        }
        
        // Adiciona o menu de usuário na tag nav-menu
        if (content.includes('<div class="nav-menu">') && !content.includes('user-menu')) {
            // Verifica se a div nav-menu já foi fechada
            const navMenuStart = content.indexOf('<div class="nav-menu">');
            const navMenuEnd = content.indexOf('</div>', navMenuStart);
            const navMenuContent = content.substring(navMenuStart, navMenuEnd);
            
            // Substitui a div nav-menu pelo conteúdo original + menu de usuário
            content = content.replace(
                navMenuContent + '</div>',
                navMenuContent + userMenuHTML + '</div>'
            );
            
            // Salva o arquivo modificado
            fs.writeFileSync(filePath, content);
            console.log(`Menu de usuário adicionado em ${file}`);
        } else {
            console.log(`Não foi possível adicionar menu de usuário em ${file} (tag nav-menu não encontrada ou já tem o menu)`);
        }
    });

    console.log('Processo concluído!');
}

// Executa a função
addUserMenu();
