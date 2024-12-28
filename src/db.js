const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sundar', // senha que você usou
    database: 'pdv_surya'
});

module.exports = connection;