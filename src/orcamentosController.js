const connection = require('./db.js');

const orcamentosController = {
    // No método listar do orcamentosController
listar: (req, res) => {
    const query = `
        SELECT o.*, 
               COUNT(i.id) as total_itens,
               GROUP_CONCAT(i.produto SEPARATOR ', ') as produtos
        FROM orcamentos o
        LEFT JOIN orcamento_itens i ON o.id = i.orcamento_id
        GROUP BY o.id
        ORDER BY o.data_criacao DESC
    `;
    
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erro ao listar orçamentos:', error);
            return res.status(500).json({ error: 'Erro ao listar orçamentos' });
        }
        
        // Não precisa mais do processamento manual dos produtos
        console.log('Resultados:', results);
        res.json(results);
    });
},
    criar: (req, res) => {
        connection.beginTransaction((err) => {
            if (err) {
                console.error('Erro ao iniciar transação:', err);
                return res.status(500).json({ error: 'Erro ao criar orçamento' });
            }

            const orcamentoQuery = `
                INSERT INTO orcamentos 
                (cliente, data_validade, condicoes_pagamento, prazo_entrega, observacoes, total) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const orcamentoValues = [
                req.body.cliente,
                req.body.dataValidade,
                req.body.condicoesPagamento,
                req.body.prazoEntrega,
                req.body.observacoes,
                req.body.total
            ];

            connection.query(orcamentoQuery, orcamentoValues, (error, result) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error('Erro ao inserir orçamento:', error);
                        res.status(500).json({ error: 'Erro ao criar orçamento' });
                    });
                }

                const orcamentoId = result.insertId;
                let itemsProcessed = 0;
                
                req.body.itens.forEach((item, index) => {
                    const itemQuery = `
                        INSERT INTO orcamento_itens 
                        (orcamento_id, produto, quantidade, valor_unitario) 
                        VALUES (?, ?, ?, ?)
                    `;
                    
                    connection.query(itemQuery, 
                        [orcamentoId, item.produto, item.quantidade, item.valorUnitario],
                        (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    console.error('Erro ao inserir item:', err);
                                    res.status(500).json({ error: 'Erro ao criar itens do orçamento' });
                                });
                            }

                            itemsProcessed++;
                            if (itemsProcessed === req.body.itens.length) {
                                connection.commit((commitErr) => {
                                    if (commitErr) {
                                        return connection.rollback(() => {
                                            console.error('Erro no commit:', commitErr);
                                            res.status(500).json({ error: 'Erro ao finalizar orçamento' });
                                        });
                                    }
                                    res.status(201).json({ 
                                        message: 'Orçamento criado com sucesso',
                                        id: orcamentoId 
                                    });
                                });
                            }
                        }
                    );
                });
            });
        });
    },

    buscarPorId: (req, res) => {
        connection.query('SELECT * FROM orcamentos WHERE id = ?', [req.params.id], (error, orcamentos) => {
            if (error) {
                console.error('Erro ao buscar orçamento:', error);
                return res.status(500).json({ error: 'Erro ao buscar orçamento' });
            }

            if (orcamentos.length === 0) {
                return res.status(404).json({ error: 'Orçamento não encontrado' });
            }

            connection.query('SELECT * FROM orcamento_itens WHERE orcamento_id = ?', 
                [req.params.id], 
                (error, itens) => {
                    if (error) {
                        console.error('Erro ao buscar itens:', error);
                        return res.status(500).json({ error: 'Erro ao buscar itens do orçamento' });
                    }

                    const orcamento = orcamentos[0];
                    orcamento.itens = itens;
                    res.json(orcamento);
                }
            );
        });
    },

    atualizarStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        connection.query(
            'UPDATE orcamentos SET status = ? WHERE id = ?',
            [status, id],
            (error) => {
                if (error) {
                    console.error('Erro ao atualizar status:', error);
                    return res.status(500).json({ error: 'Erro ao atualizar status' });
                }
                res.json({ message: 'Status atualizado com sucesso' });
            }
        );
    },

    atualizar: (req, res) => {
        connection.beginTransaction((err) => {
            if (err) {
                console.error('Erro ao iniciar transação:', err);
                return res.status(500).json({ error: 'Erro ao atualizar orçamento' });
            }

            const { id } = req.params;
            const orcamentoQuery = `
                UPDATE orcamentos 
                SET cliente = ?, 
                    data_validade = ?, 
                    condicoes_pagamento = ?, 
                    prazo_entrega = ?, 
                    observacoes = ?, 
                    total = ?
                WHERE id = ?
            `;
            
            const orcamentoValues = [
                req.body.cliente,
                req.body.dataValidade,
                req.body.condicoesPagamento,
                req.body.prazoEntrega,
                req.body.observacoes,
                req.body.total,
                id
            ];

            connection.query(orcamentoQuery, orcamentoValues, (error) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error('Erro ao atualizar orçamento:', error);
                        res.status(500).json({ error: 'Erro ao atualizar orçamento' });
                    });
                }

                // Remove os itens antigos
                connection.query('DELETE FROM orcamento_itens WHERE orcamento_id = ?', [id], (error) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error('Erro ao remover itens antigos:', error);
                            res.status(500).json({ error: 'Erro ao atualizar orçamento' });
                        });
                    }

                    // Adiciona os novos itens
                    let itemsProcessed = 0;
                    
                    if (!req.body.itens || req.body.itens.length === 0) {
                        return connection.commit((commitErr) => {
                            if (commitErr) {
                                return connection.rollback(() => {
                                    console.error('Erro no commit:', commitErr);
                                    res.status(500).json({ error: 'Erro ao finalizar orçamento' });
                                });
                            }
                            res.json({ 
                                message: 'Orçamento atualizado com sucesso',
                                id: id 
                            });
                        });
                    }
                    
                    req.body.itens.forEach((item, index) => {
                        const itemQuery = `
                            INSERT INTO orcamento_itens 
                            (orcamento_id, produto, quantidade, valor_unitario) 
                            VALUES (?, ?, ?, ?)
                        `;
                        
                        connection.query(itemQuery, 
                            [id, item.produto, item.quantidade, item.valorUnitario],
                            (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        console.error('Erro ao inserir item:', err);
                                        res.status(500).json({ error: 'Erro ao criar itens do orçamento' });
                                    });
                                }

                                itemsProcessed++;
                                if (itemsProcessed === req.body.itens.length) {
                                    connection.commit((commitErr) => {
                                        if (commitErr) {
                                            return connection.rollback(() => {
                                                console.error('Erro no commit:', commitErr);
                                                res.status(500).json({ error: 'Erro ao finalizar orçamento' });
                                            });
                                        }
                                        res.json({ 
                                            message: 'Orçamento atualizado com sucesso',
                                            id: id 
                                        });
                                    });
                                }
                            }
                        );
                    });
                });
            });
        });
    },

    deletar: (req, res) => {
        connection.query('DELETE FROM orcamentos WHERE id = ?', [req.params.id], (error) => {
            if (error) {
                console.error('Erro ao excluir orçamento:', error);
                return res.status(500).json({ error: 'Erro ao excluir orçamento' });
            }
            res.json({ message: 'Orçamento excluído com sucesso' });
        });
    }
};

module.exports = orcamentosController;