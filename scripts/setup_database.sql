-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS pdv_surya;
USE pdv_surya;

-- Criar tabela de usuários se não existir
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário demo se não existir
INSERT INTO users (usuario, email, senha)
SELECT 'demo', 'demo@surya.com', 'demo123'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'demo@surya.com'
);