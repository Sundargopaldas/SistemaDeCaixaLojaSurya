const connection = require('./db.js');

const ClienteController = {
    // Listar todos os clientes
    listar(req, res) {
        connection.query(
            'SELECT * FROM clientes ORDER BY nome',
            (err, results) => {
                if (err) {
                    console.error('Erro ao listar clientes:', err);
                    return res.status(500).json({ error: 'Erro ao listar clientes' });
                }
                res.json(results);
            }
        );
    },

    // Criar novo cliente
    criar(req, res) {
        const { nome, endereco, telefone } = req.body;
        
        connection.query(
            'INSERT INTO clientes (nome, endereco, telefone) VALUES (?, ?, ?)',
            [nome, endereco, telefone],
            (err, result) => {
                if (err) {
                    console.error('Erro ao cadastrar cliente:', err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({
                            success: false,
                            message: 'Telefone já cadastrado para outro cliente'
                        });
                    }
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao cadastrar cliente'
                    });
                }
                
                res.json({
                    success: true,
                    message: 'Cliente cadastrado com sucesso',
                    id: result.insertId
                });
            }
        );
    },

    // Buscar cliente por ID
    buscarPorId(req, res) {
        const { id } = req.params;
        
        connection.query(
            'SELECT * FROM clientes WHERE id = ?',
            [id],
            (err, results) => {
                if (err) {
                    console.error('Erro ao buscar cliente:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao buscar cliente'
                    });
                }
                
                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Cliente não encontrado'
                    });
                }
                
                res.json(results[0]);
            }
        );
    },

    // Atualizar cliente
    atualizar(req, res) {
        const { id } = req.params;
        const { nome, endereco, telefone } = req.body;
        
        connection.query(
            'UPDATE clientes SET nome = ?, endereco = ?, telefone = ? WHERE id = ?',
            [nome, endereco, telefone, id],
            (err, result) => {
                if (err) {
                    console.error('Erro ao atualizar cliente:', err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({
                            success: false,
                            message: 'Telefone já cadastrado para outro cliente'
                        });
                    }
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao atualizar cliente'
                    });
                }
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Cliente não encontrado'
                    });
                }
                
                res.json({
                    success: true,
                    message: 'Cliente atualizado com sucesso'
                });
            }
        );
    },

    // Excluir cliente
    deletar(req, res) {
        const { id } = req.params;
        
        connection.query(
            'DELETE FROM clientes WHERE id = ?',
            [id],
            (err, result) => {
                if (err) {
                    console.error('Erro ao excluir cliente:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao excluir cliente'
                    });
                }
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Cliente não encontrado'
                    });
                }
                
                res.json({
                    success: true,
                    message: 'Cliente excluído com sucesso'
                });
            }
        );
    }
};

module.exports = ClienteController;