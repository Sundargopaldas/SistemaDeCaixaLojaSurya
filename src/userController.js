const connection = require('./db.js');

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
         res.json({ message: 'Login realizado com sucesso' });
       } else {
         res.status(401).json({ error: 'Credenciais inválidas' });
       }
     }
   );
 }
};

module.exports = userController;