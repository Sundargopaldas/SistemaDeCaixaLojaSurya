const jwt = require('jsonwebtoken');

// Chave secreta para assinatura do token JWT
const SECRET_KEY = 'surya_loja_esoterica_secret_2025';

// Middleware para gerar token JWT na autenticação
function generateToken(userId, usuario) {
  return jwt.sign({ userId, usuario }, SECRET_KEY, { expiresIn: '24h' });
}

// Middleware para verificar se o usuário está autenticado
function verificarAcesso(req, res, next) {
  console.log(`Verificando acesso para ${req.path}`);
  
  // Lista de rotas públicas que não exigem autenticação
  const rotasPublicas = [
    '/login', 
    '/cadastro', 
    '/js/', 
    '/css/', 
    '/img/', 
    '/listaDeClientes',
    '/cadastroDeClientes',
    '/api/users/login', 
    '/api/users/register', 
    '/api/users/verify-token', 
    '/api/users/refresh-token'
  ];
  
  // Verificar se a rota é pública
  const rotaPublica = rotasPublicas.some(rota => 
    req.path === rota || 
    (rota.endsWith('/') && req.path.startsWith(rota))
  );
  
  if (rotaPublica) {
    console.log(`Rota pública: ${req.path}`);
    return next();
  }
  
  // Verificar token no cookie ou no header Authorization
  const tokenCookie = req.cookies.authToken;
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split(' ')[1] : tokenCookie;
  
  console.log(`Verificando token: ${token ? 'Token encontrado' : 'Token não encontrado'}`);
  
  if (!token) {
    console.log('Acesso negado: Nenhum token fornecido');
    // Se estiver tentando acessar o index, redireciona para login
    if (req.path === '/' || req.path === '/index.html') {
      return res.redirect('/login');
    }
    
    // Para requisições AJAX (API)
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Acesso não autorizado' });
    }
    
    // Para acesso direto a páginas HTML
    return res.redirect('/login');
  }
  
  try {
    // Verificar validade do token
    const decoded = jwt.verify(token, SECRET_KEY);
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error.message);
    // Se o token for inválido ou expirado, limpa o cookie e redireciona para login
    res.clearCookie('authToken');
    
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    
    return res.redirect('/login');
  }
}

// Middleware para verificar autenticação
function checkAuth(req, res, next) {
  // Tenta obter o token de diversas fontes
  let token = null;
  
  // 1. Tenta do cabeçalho Authorization
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }
  }
  
  // 2. Se não encontrar, verifica cookies
  if (!token && req.cookies) {
    token = req.cookies.authToken;
    
    // Tenta outros cookies relacionados a autenticação
    if (!token) {
      const cookieKeys = Object.keys(req.cookies);
      for (const key of cookieKeys) {
        if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) {
          token = req.cookies[key];
          break;
        }
      }
    }
  }
  
  // 3. Último recurso: parâmetros de query
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

module.exports = {
  generateToken,
  checkAuth,
  verificarAcesso
};
