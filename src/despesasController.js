const connection = require('./db');

const despesasController = {
    listar: async (req, res) => {
        const query = `
            SELECT * FROM despesas 
            ORDER BY data_vencimento`;
        
        connection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Erro ao buscar despesas' });
            }
            res.json(results);
        });
    },

    criar: async (req, res) => {
        const { descricao, valor, data_vencimento, categoria, observacoes } = req.body;
        
        const query = `
            INSERT INTO despesas 
            (descricao, valor, data_vencimento, categoria, observacoes) 
            VALUES (?, ?, ?, ?, ?)`;
        
        connection.query(query, [descricao, valor, data_vencimento, categoria, observacoes], 
            (error, results) => {
                if (error) {
                    return res.status(500).json({ error: 'Erro ao criar despesa' });
                }
                res.status(201).json({ id: results.insertId, message: 'Despesa criada com sucesso' });
            });
    },

    atualizar: async (req, res) => {
        const { id } = req.params;
        const { descricao, valor, data_vencimento, data_pagamento, categoria, status, observacoes } = req.body;
        
        const query = `
            UPDATE despesas 
            SET descricao = ?, valor = ?, data_vencimento = ?, 
                data_pagamento = ?, categoria = ?, status = ?, observacoes = ?
            WHERE id = ?`;
        
        connection.query(query, 
            [descricao, valor, data_vencimento, data_pagamento, categoria, status, observacoes, id], 
            (error) => {
                if (error) {
                    return res.status(500).json({ error: 'Erro ao atualizar despesa' });
                }
                res.json({ message: 'Despesa atualizada com sucesso' });
            });
    },

    deletar: async (req, res) => {
        const { id } = req.params;
        
        connection.query('DELETE FROM despesas WHERE id = ?', [id], (error) => {
            if (error) {
                return res.status(500).json({ error: 'Erro ao deletar despesa' });
            }
            res.json({ message: 'Despesa deletada com sucesso' });
        });
    }
};

module.exports = despesasController;