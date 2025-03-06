const fs = require('fs');
const path = require('path');

// Diretório dos scripts JS
const jsDir = path.join(__dirname, '..', 'public', 'js');

// Lista de scripts que não precisam de modificação
const excludeScripts = ['auth.js', 'login.js'];

// Padrão regex para identificar chamadas fetch
const fetchRegex = /fetch\s*\(\s*(['"].*?['"]|`.*?`|[^)]*)\s*(?:,\s*(\{[^}]*\}))?\s*\)/g;

// Função para adicionar autenticação às chamadas fetch
function addAuthToFetchCalls() {
    // Obtém a lista de arquivos JS
    const files = fs.readdirSync(jsDir).filter(file => 
        file.endsWith('.js') && !excludeScripts.includes(file)
    );

    console.log(`Encontrados ${files.length} arquivos JS para adicionar autenticação`);

    // Para cada arquivo, adiciona a autenticação às chamadas fetch
    files.forEach(file => {
        const filePath = path.join(jsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Verifica se já tem uma função getAuthHeaders ou usa headers de autenticação
        if (content.includes('getAuthHeaders') || 
            content.includes('Authorization') || 
            content.includes('x-auth-token')) {
            console.log(`${file} já possui autenticação.`);
            return;
        }

        // Adiciona a função getAuthHeaders se não existir
        if (!content.includes('function getAuthHeaders()')) {
            const authFunction = `
// Função para obter os headers de autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? \`Bearer \${token}\` : ''
    };
}
`;
            content = authFunction + content;
            modified = true;
        }

        // Substitui as chamadas fetch para incluir headers de autenticação
        const newContent = content.replace(fetchRegex, (match, url, options) => {
            // Se já tem headers definidos, adiciona Authorization
            if (options && options.includes('headers')) {
                console.log(`[${file}] Fetch com headers já definidos. Verificando se tem autenticação.`);
                // Apenas substitui se não tiver Authorization ou x-auth-token
                if (!options.includes('Authorization') && !options.includes('x-auth-token')) {
                    return match.replace(/headers\s*:\s*(\{[^}]*\})/, (headerMatch, headerObj) => {
                        return headerMatch.replace(headerObj, headerObj.replace(/}$/, ', ...getAuthHeaders() }'));
                    });
                }
                return match;
            }
            
            // Se tem options mas não tem headers, adiciona headers
            else if (options) {
                return match.replace(/(\{[^}]*\})/, (optMatch) => {
                    return optMatch.replace(/}$/, ', headers: getAuthHeaders() }');
                });
            }
            
            // Se não tem options, adiciona options com headers
            else {
                return `fetch(${url}, { headers: getAuthHeaders() })`;
            }
        });

        // Se o conteúdo foi modificado, salva o arquivo
        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent);
            console.log(`Autenticação adicionada a ${file}`);
            modified = true;
        }

        if (!modified) {
            console.log(`Nenhuma modificação necessária em ${file}`);
        }
    });

    console.log('Processo concluído!');
}

// Executa a função
addAuthToFetchCalls();
