const mysql = require('mysql2');

// Configuração da conexão
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'sundar',
    database: 'pdv_surya',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 10 segundos
    dateStrings: true // Retorna datas como strings para evitar problemas de timezone
};

// Criação do pool de conexões
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// Verificação inicial da conexão
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Conexão com o banco de dados perdida');
        } else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('O banco de dados tem muitas conexões');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Conexão com o banco de dados recusada');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Acesso negado ao banco de dados. Verifique usuário e senha.');
        } else {
            console.error('Erro na conexão com o banco de dados:', err.message);
        }
    } else {
        console.log('Conectado ao banco de dados MySQL! ID da conexão:', connection.threadId);
        connection.release(); // Libera a conexão
    }
});

// Eventos do pool
pool.on('acquire', (connection) => {
    console.log('Conexão %d adquirida', connection.threadId);
});

pool.on('connection', (connection) => {
    console.log('Nova conexão feita. ID da conexão:', connection.threadId);
});

pool.on('enqueue', () => {
    console.log('Aguardando por uma conexão disponível');
});

pool.on('release', (connection) => {
    console.log('Conexão %d liberada', connection.threadId);
});

// Exporta o pool de conexões para uso em outros módulos
module.exports = pool;