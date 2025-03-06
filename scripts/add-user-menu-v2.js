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
const userMenuHTML = `<div class="user-menu">
        <div class="user-icon">U</div>
        <div class="dropdown-content">
            <a href="javascript:void(0)" onclick="fazerLogout()">Sair</a>
        </div>
    </div>`;

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
        
        // Identifica a tag nav-menu e adiciona o menu do usuário
        const navMenuTag = '<div class="nav-menu">';
        if (content.includes(navMenuTag)) {
            // Encontra a última linha de </a> antes do fechamento do nav-menu
            const navMenuStartIndex = content.indexOf(navMenuTag);
            const navMenuEndCloseDiv = content.indexOf('</div>', navMenuStartIndex);
            
            // Verifica se tem conteúdo antes do fechamento
            const beforeCloseDiv = content.substring(0, navMenuEndCloseDiv).trim();
            const lastAnchorIndex = beforeCloseDiv.lastIndexOf('</a>');
            
            if (lastAnchorIndex !== -1) {
                // Insere o menu de usuário após o último link
                const firstPart = content.substring(0, lastAnchorIndex + 4); // +4 para incluir o </a>
                const lastPart = content.substring(lastAnchorIndex + 4);
                
                content = firstPart + '\n    ' + userMenuHTML + lastPart;
                fs.writeFileSync(filePath, content);
                console.log(`Menu de usuário adicionado em ${file}`);
            } else {
                console.log(`Não foi possível encontrar links na navbar em ${file}`);
            }
        } else {
            console.log(`Não foi possível encontrar a barra de navegação em ${file}`);
        }
    });

    console.log('Processo concluído!');
}

// Executa a função
addUserMenu();
