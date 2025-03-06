const fs = require('fs');
const path = require('path');

// Diretório das páginas HTML
const pagesDir = path.join(__dirname, '..', 'public');

// Lista de páginas que não precisam de botão de logout
const publicPages = ['login.html', 'cadastro.html', 'index.html'];

// Adiciona script para botão de logout em todas as páginas HTML protegidas
function addLogoutHandler() {
    // Obtém a lista de arquivos HTML
    const files = fs.readdirSync(pagesDir).filter(file => 
        file.endsWith('.html') && !publicPages.includes(file)
    );

    console.log(`Encontradas ${files.length} páginas protegidas para adicionar função de logout`);

    // Para cada arquivo, verifica o botão e adiciona a função de logout se necessário
    files.forEach(file => {
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Verifica se tem algum botão de logout
        const hasLogoutBtn = content.includes('id="btn-logout"') || 
                             content.includes('id="logout-btn"');
        
        // Verifica se tem a função de logout
        if (content.includes('function fazerLogout()')) {
            console.log(`${file} já possui a função de logout.`);
        } else {
            // Adiciona função de logout
            const logoutScript = `
<script>
function fazerLogout() {
    // Remove o token do localStorage
    localStorage.removeItem('token');
    
    // Faz uma requisição para o servidor para invalidar o token
    fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        // Redireciona para a página de login
        window.location.href = '/login.html';
    })
    .catch(error => {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, redireciona para a página de login
        window.location.href = '/login.html';
    });
}

// Adiciona evento de click ao botão de logout se existir
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('btn-logout') || document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', fazerLogout);
    }
});
</script>
            `;
            
            // Adiciona o script antes do </body>
            if (content.includes('</body>')) {
                content = content.replace('</body>', logoutScript + '\n</body>');
                fs.writeFileSync(filePath, content);
                console.log(`Função de logout adicionada a ${file}`);
                modified = true;
            } else {
                console.log(`ERRO: ${file} não possui a tag </body>`);
            }
        }

        // Se não tem botão de logout, tenta adicionar um
        if (!hasLogoutBtn) {
            // Verifica se tem a estrutura de menu nav-menu
            if (content.includes('<div class="nav-menu">')) {
                const logoutBtn = `
    <button id="btn-logout" class="btn-logout">Sair</button>
</div>`;
                content = content.replace('</div>', logoutBtn);
                fs.writeFileSync(filePath, content);
                console.log(`Botão de logout adicionado a ${file} (nav-menu)`);
                modified = true;
            }
            // Tenta adicionar ao navbar se existir
            else if (content.includes('<nav')) {
                const logoutBtn = `
            <div class="nav-item ml-auto">
                <button id="logout-btn" class="btn btn-outline-danger my-2 my-sm-0">Sair</button>
            </div>
            </nav>`;
                
                content = content.replace('</nav>', logoutBtn);
                fs.writeFileSync(filePath, content);
                console.log(`Botão de logout adicionado a ${file} (navbar)`);
                modified = true;
            }
            else {
                console.log(`AVISO: ${file} não possui estrutura de menu reconhecida para adicionar botão de logout.`);
            }
        }

        if (!modified) {
            console.log(`Nenhuma modificação necessária em ${file}`);
        }
    });

    console.log('Processo concluído!');
}

// Executa a função
addLogoutHandler();
