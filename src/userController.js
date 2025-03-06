const connection = require('./db.js');
const { generateToken } = require('./middleware/auth');
const jwt = require('jsonwebtoken');

// Chave secreta para assinatura do token JWT (deve ser a mesma usada em auth.js)
const SECRET_KEY = 'surya_loja_esoterica_secret_2025';

const userController = {
 register: (req, res) => {
   const { usuario, email, senha } = req.body;

   connection.query(
     'INSERT INTO users (usuario, email, senha) VALUES (?, ?, ?)',
     [usuario, email, senha],
     (error) => {
       if (error) {
         console.error(error);
         return res.status(500).json({ error: 'Erro ao criar conta' });
       }
       res.json({ message: 'Conta criada com sucesso' });
     }
   );
 },

 login: (req, res) => {
   const { email, senha, usuario } = req.body;

   connection.query(
     'SELECT * FROM users WHERE email = ? AND senha = ? AND usuario = ?',
     [email, senha, usuario],
     (error, results) => {
       if (error) {
         console.error(error);
         return res.status(500).json({ error: 'Erro ao fazer login' });
       }
       if (results.length > 0) {
         // Gerar token JWT
         const user = results[0];
         const token = generateToken(user.id, user.usuario);
         
         // Definir cookie com o token (expira em 24 horas)
         res.cookie('authToken', token, { 
           httpOnly: true, 
           maxAge: 24 * 60 * 60 * 1000, 
           sameSite: 'strict'
         });
         
         res.json({ 
           message: 'Login realizado com sucesso',
           token: token,
           usuario: user.usuario
         });
       } else {
         res.status(401).json({ error: 'Credenciais inválidas' });
       }
     }
   );
 },

 logout: (req, res) => {
   // Limpa o cookie de autenticação
   res.clearCookie('authToken');
   res.json({ message: 'Logout realizado com sucesso' });
 },

 verificarAutenticacao: (req, res) => {
   // Verifica se o usuário está autenticado
   // Esta rota será chamada pelo frontend para verificar se o usuário tem uma sessão válida
   res.json({ autenticado: true, usuario: req.usuario });
 },

 // Nova função para verificar validade do token
 verifyToken: (req, res) => {
   try {
     const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
     
     if (!token) {
       return res.json({ valid: false, message: 'Token não fornecido' });
     }
     
     // Verifica se o token é válido
     jwt.verify(token, SECRET_KEY, (err, decoded) => {
       if (err) {
         return res.json({ 
           valid: false, 
           message: 'Token inválido ou expirado',
           error: err.name
         });
       }
       
       // Token é válido
       return res.json({ 
         valid: true, 
         message: 'Token válido',
         usuario: decoded.usuario,
         expires: new Date(decoded.exp * 1000)
       });
     });
   } catch (error) {
     return res.status(500).json({ 
       valid: false, 
       message: 'Erro ao verificar token',
       error: error.message
     });
   }
 },

 // Nova função para renovar o token
 refreshToken: (req, res) => {
   try {
     const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
     
     if (!token) {
       return res.status(401).json({ error: 'Token não fornecido' });
     }
     
     // Verifica o token atual
     jwt.verify(token, SECRET_KEY, (err, decoded) => {
       if (err) {
         return res.status(401).json({ 
           error: 'Token inválido ou expirado',
           details: err.name
         });
       }
       
       // Gera um novo token com os mesmos dados
       const newToken = generateToken(decoded.userId, decoded.usuario);
       
       // Atualiza o cookie
       res.cookie('authToken', newToken, { 
         httpOnly: true, 
         maxAge: 24 * 60 * 60 * 1000, 
         sameSite: 'strict'
       });
       
       // Retorna o novo token
       return res.json({ 
         message: 'Token renovado com sucesso',
         token: newToken,
         usuario: decoded.usuario
       });
     });
   } catch (error) {
     return res.status(500).json({ 
       error: 'Erro ao renovar token',
       details: error.message
     });
   }
 }
};

module.exports = userController;