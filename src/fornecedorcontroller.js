const connection = require('./db.js');

const FornecedorController = {
    // Listar todos os fornecedores
    listar(req, res) {
        connection.query(
            'SELECT * FROM fornecedores ORDER BY razao_social',
            (err, results) => {
                if (err) {
                    console.error('Erro ao listar fornecedores:', err);
                    return res.status(500).json({ error: 'Erro ao listar fornecedores' });
                }
                res.json(results);
            }
        );
    },

    // Criar novo fornecedor
    criar(req, res) {
        const { razao_social, nome_fantasia, cnpj, email, telefone, endereco } = req.body;
        
        connection.query(
            'INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, email, telefone, endereco) VALUES (?, ?, ?, ?, ?, ?)',
            [razao_social, nome_fantasia, cnpj, email, telefone, endereco],
            (err, result) => {
                if (err) {
                    console.error('Erro ao cadastrar fornecedor:', err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({
                            success: false,
                            message: 'CNPJ já cadastrado para outro fornecedor'
                        });
                    }
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao cadastrar fornecedor'
                    });
                }
                
                res.json({
                    success: true,
                    message: 'Fornecedor cadastrado com sucesso',
                    id: result.insertId
                });
            }
        );
    },

    // Buscar fornecedor por ID
    buscarPorId(req, res) {
        const { id } = req.params;
        
        connection.query(
            'SELECT * FROM fornecedores WHERE id = ?',
            [id],
            (err, results) => {
                if (err) {
                    console.error('Erro ao buscar fornecedor:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao buscar fornecedor'
                    });
                }
                
                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Fornecedor não encontrado'
                    });
                }
                
                res.json(results[0]);
            }
        );
    },

    // Atualizar fornecedor
    atualizar(req, res) {
        const { id } = req.params;
        const { razao_social, nome_fantasia, cnpj, email, telefone, endereco } = req.body;
        
        connection.query(
            'UPDATE fornecedores SET razao_social = ?, nome_fantasia = ?, cnpj = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?',
            [razao_social, nome_fantasia, cnpj, email, telefone, endereco, id],
            (err, result) => {
                if (err) {
                    console.error('Erro ao atualizar fornecedor:', err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({
                            success: false,
                            message: 'CNPJ já cadastrado para outro fornecedor'
                        });
                    }
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao atualizar fornecedor'
                    });
                }
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Fornecedor não encontrado'
                    });
                }
                
                res.json({
                    success: true,
                    message: 'Fornecedor atualizado com sucesso'
                });
            }
        );
    },

    // Excluir fornecedor
    deletar(req, res) {
        const { id } = req.params;
        
        connection.query(
            'DELETE FROM fornecedores WHERE id = ?',
            [id],
            (err, result) => {
                if (err) {
                    console.error('Erro ao excluir fornecedor:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao excluir fornecedor'
                    });
                }
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Fornecedor não encontrado'
                    });
                }
                
                res.json({
                    success: true,
                    message: 'Fornecedor excluído com sucesso'
                });
            }
        );
    }
};

module.exports = FornecedorController;