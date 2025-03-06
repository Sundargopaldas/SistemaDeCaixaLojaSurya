const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const routes = require('./Routes.js');
const { verificarAcesso, checkAuth } = require('./src/middleware/auth');
const pool = require('./src/db.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware para MIME types
app.use('/js', (req, res, next) => {
    res.type('application/javascript');
    next();
});

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para verificar autenticação
app.use(verificarAcesso);

// Rotas API
app.use('/', routes);

// Rota de teste para verificação de autenticação
app.get('/api/auth-test', verificarAcesso, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Usuário autenticado corretamente',
        timestamp: new Date().toISOString()
    });
});

// Função para iniciar o servidor com tratamento de erros
const PORT = process.env.PORT || 3001;

const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.log(`A porta ${port} já está em uso. Tentando a porta ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Erro ao iniciar o servidor:', error);
        }
    });
};

// Iniciar o servidor
startServer(PORT);