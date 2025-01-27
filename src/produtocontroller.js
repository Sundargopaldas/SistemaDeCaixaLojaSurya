const connection = require('./db.js');

const ProdutoController = {
    listar(req, res) {
        connection.query(
            'SELECT p.*, c.nome as categoria FROM produtos p JOIN categorias c ON p.categoria_id = c.id',
            (err, results) => {
                if (err) return res.status(500).json(err);
                res.json(results);
            }
        );
    },

  criar(req, res) {
    const { nome, preco, quantidade = 0, categoria_id } = req.body;
    const quantidadeInicial = parseInt(quantidade) || 0;
    
    connection.query(
        'INSERT INTO produtos (nome, preco, quantidade, categoria_id) VALUES (?, ?, ?, ?)',
        [nome, preco, quantidadeInicial, categoria_id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.status(201).json({
                id: result.insertId,
                nome,
                preco,
                quantidade: quantidadeInicial,
                categoria_id
                });
            }
        );
    },

    deletar(req, res) {
        const id = req.params.id;
        connection.query(
            'DELETE FROM produtos WHERE id = ?',
            [id],
            (err, result) => {
                if (err) return res.status(500).json(err);
                res.json({ message: 'Produto deletado' });
            }
        );
    },

    atualizar(req, res) {
        const { nome, preco, estoque, categoria_id } = req.body;
        const id = req.params.id;
        connection.query(
            'UPDATE produtos SET nome = ?, preco = ?, estoque = ?, categoria_id = ? WHERE id = ?',
            [nome, preco, estoque, categoria_id, id],
            (err, result) => {
                if (err) return res.status(500).json(err);
                res.json({ id, nome, preco, estoque, categoria_id });
            }
        );
    },

    buscarProduto(req, res) {
    const { termo } = req.query;
    connection.query(
        'SELECT p.*, c.nome as categoria FROM produtos p JOIN categorias c ON p.categoria_id = c.id WHERE p.nome LIKE ?',
        [`%${termo}%`],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    )
    },


    // Novos métodos de controle de estoque
    verificarEstoque(req, res) {
        const produtoId = req.params.id;
        
        connection.query(
            'SELECT quantidade FROM produtos WHERE id = ?',
            [produtoId],
            (err, results) => {
                if (err) {
                    console.error('Erro ao verificar estoque:', err);
                    return res.status(500).json({ error: 'Erro ao verificar estoque' });
                }
                
                if (results.length === 0) {
                    return res.status(404).json({ error: 'Produto não encontrado' });
                }
                
                res.json({ quantidade: results[0].quantidade });
            }
        );
    },

    atualizarEstoque(req, res) {
        const produtoId = req.params.id;
        const { quantidade } = req.body;
        
        // Primeiro verifica se tem estoque suficiente
        connection.query(
            'SELECT quantidade FROM produtos WHERE id = ?',
            [produtoId],
            (err, results) => {
                if (err) {
                    console.error('Erro ao verificar estoque:', err);
                    return res.status(500).json({ success: false, message: 'Erro ao verificar estoque' });
                }
                
                if (results.length === 0) {
                    return res.status(404).json({ success: false, message: 'Produto não encontrado' });
                }
                
                const estoqueAtual = results[0].quantidade;
                const novoEstoque = estoqueAtual - quantidade;
                
                if (novoEstoque < 0) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Estoque insuficiente',
                        estoqueAtual: estoqueAtual 
                    });
                }
                
                // Atualiza o estoque
                connection.query(
                    'UPDATE produtos SET quantidade = ? WHERE id = ?',
                    [novoEstoque, produtoId],
                    (updateErr) => {
                        if (updateErr) {
                            console.error('Erro ao atualizar estoque:', updateErr);
                            return res.status(500).json({ success: false, message: 'Erro ao atualizar estoque' });
                        }
                        
                        res.json({ 
                            success: true, 
                            message: 'Estoque atualizado com sucesso',
                            novoEstoque: novoEstoque 
                        });
                    }
                );
            }
        );
    },

    devolverAoEstoque(req, res) {
        const produtoId = req.params.id;
        const { quantidade } = req.body;
        
        connection.query(
            'UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?',
            [quantidade, produtoId],
            (err) => {
                if (err) {
                    console.error('Erro ao devolver ao estoque:', err);
                    return res.status(500).json({ success: false, message: 'Erro ao devolver ao estoque' });
                }
                
                res.json({ 
                    success: true, 
                    message: 'Quantidade devolvida ao estoque com sucesso'
                });
            }
        );
    }
};

module.exports = ProdutoController;
