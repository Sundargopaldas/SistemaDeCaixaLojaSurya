/**
 * API de Autenticação
 * Middleware para verificar a autenticação em rotas da API
 */

const jwt = require('jsonwebtoken');

// Chave secreta para validação de tokens (deve ser a mesma usada no userController.js)
const SECRET_KEY = 'surya_loja_esoterica_secret_2025';

/**
 * Middleware para verificar a autenticação via token JWT
 * @param {Object} req - Requisição
 * @param {Object} res - Resposta
 * @param {Function} next - Função para passar para o próximo middleware
 */
const verificarToken = (req, res, next) => {
    try {
        console.log('Verificando token de autenticação para request:', req.originalUrl);
        
        // Verificar se há token no cabeçalho de autorização
        let token = null;
        const authHeader = req.headers.authorization;
        
        if (authHeader) {
            // Formato esperado: "Bearer <token>"
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1];
                console.log('Token encontrado no cabeçalho de autorização');
            }
        }
        
        // Se não houver token no cabeçalho, tentar obter dos cookies
        if (!token) {
            token = getCookieFromRequest(req, 'authToken');
            if (token) {
                console.log('Token encontrado nos cookies');
            }
        }
        
        // Se ainda não encontrou o token
        if (!token) {
            console.log('Nenhum token de autenticação encontrado');
            return res.status(401).json({ 
                success: false, 
                message: 'Token de autenticação não fornecido' 
            });
        }
        
        // Verificar o token
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                console.error('Erro ao verificar token:', err.name);
                return res.status(401).json({ 
                    success: false, 
                    message: 'Token inválido ou expirado', 
                    error: err.name 
                });
            }
            
            // Token válido, salvar dados do usuário na requisição
            req.user = {
                id: decoded.userId,
                usuario: decoded.usuario
            };
            
            console.log(`Usuário autenticado: ${decoded.usuario} (ID: ${decoded.userId})`);
            return next();
        });
    } catch (error) {
        console.error('Erro crítico ao verificar autenticação:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao verificar autenticação'
        });
    }
};

/**
 * Extrai um cookie da requisição
 * @param {Object} req - Requisição
 * @param {string} name - Nome do cookie
 * @returns {string|null} Valor do cookie ou null se não encontrado
 */
function getCookieFromRequest(req, name) {
    if (!req.headers.cookie) return null;
    
    const cookies = req.headers.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return cookieValue;
        }
    }
    return null;
}

module.exports = {
    verificarToken
};
