/**
 * Configuração JWT
 * Configurações para o JSON Web Token
 */

module.exports = {
    // Chave secreta para assinatura do token (em produção, deve ser uma chave forte e armazenada em variável de ambiente)
    secret: 'pdv-surya-secret-key-2023',
    
    // Tempo de expiração do token (em segundos)
    expiresIn: 86400, // 24 horas
    
    // Tempo de expiração do refresh token (em segundos)
    refreshExpiresIn: 604800, // 7 dias
    
    // Emissor do token
    issuer: 'pdv-surya',
    
    // Audiência do token
    audience: 'pdv-surya-client'
};
