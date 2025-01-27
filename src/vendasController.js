const connection = require('./db');
const { Venda, Caixa } = require('./modelsVendas.js');

const caixa = new Caixa();

const vendasController = {
    abrirCaixa: (req, res) => {
        try {
            const { saldoInicial } = req.body;
            caixa.abrirCaixa(saldoInicial);
            res.json({ message: 'Caixa aberto com sucesso' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    registrarVenda: async (req, res) => {
        try {
            const { itens, formaPagamento, valorPago } = req.body;
            
            const result = await new Promise((resolve, reject) => {
                const query = 'INSERT INTO vendas (data, total, forma_pagamento, valor_pago) VALUES (NOW(), 0, ?, ?)';
                connection.query(query, [formaPagamento, valorPago], (err, res) => {
                    if (err) reject(err);
                    resolve(res);
                });
            });

            const vendaId = result.insertId;
            let totalVenda = 0;

            for (const item of itens) {
                const subtotal = item.quantidade * item.preco;
                totalVenda += subtotal;

                await new Promise((resolve, reject) => {
                    const query = 'INSERT INTO itens_venda (venda_id, produto_id, quantidade, subtotal) VALUES (?, ?, ?, ?)';
                    connection.query(query, [vendaId, item.produtoId, item.quantidade, subtotal], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });
            }

            await new Promise((resolve, reject) => {
                const query = 'UPDATE vendas SET total = ? WHERE id = ?';
                connection.query(query, [totalVenda, vendaId], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            res.json({ message: 'Venda registrada com sucesso', id: vendaId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

getVendasDia: async (req, res) => {
        try {
            const query = `
                SELECT v.*, GROUP_CONCAT(p.nome) as produtos
                FROM vendas v
                LEFT JOIN itens_venda iv ON v.id = iv.venda_id
                LEFT JOIN produtos p ON iv.produto_id = p.id
                WHERE DATE(v.data) = CURDATE()
                GROUP BY v.id
            `;
            
            connection.query(query, (error, results) => {
                if (error) throw error;
                res.json(results);
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    fecharCaixa: (req, res) => {
        try {
            const fechamento = caixa.fecharCaixa();
            res.json(fechamento);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    getVendaById: async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                v.*,
                iv.quantidade,
                iv.subtotal,
                p.nome as produto_nome,
                p.preco as produto_preco
            FROM vendas v 
            INNER JOIN itens_venda iv ON v.id = iv.venda_id
            INNER JOIN produtos p ON iv.produto_id = p.id
            WHERE v.id = ?
        `;
            
            connection.query(query, (error, results) => {
                if (error) throw error;
                res.json(results);
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getVendasMes: async (req, res) => {
        try {
            const query = `
                SELECT v.*, GROUP_CONCAT(p.nome) as produtos
                FROM vendas v
                LEFT JOIN itens_venda iv ON v.id = iv.venda_id
                LEFT JOIN produtos p ON iv.produto_id = p.id
                WHERE MONTH(v.data) = MONTH(CURDATE())
                AND YEAR(v.data) = YEAR(CURDATE())
                GROUP BY v.id
            `;
            
            connection.query(query, (error, results) => {
                if (error) throw error;
                res.json(results);
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getVendaById: async (req, res) => {
    try {
        const { id } = req.params;
        
        // Primeiro busca a venda
        connection.query('SELECT * FROM vendas WHERE id = ?', [id], (error, vendas) => {
            if (error) {
                console.error('Erro ao buscar venda:', error);
                return res.status(500).json({ error: 'Erro ao buscar venda' });
            }

            if (vendas.length === 0) {
                return res.status(404).json({ error: 'Venda não encontrada' });
            }

            // Depois busca os itens com os dados do produto
            const queryItens = `
                SELECT 
                    iv.*,
                    p.nome as produto_nome,
                    p.preco as produto_preco
                FROM itens_venda iv
                JOIN produtos p ON iv.produto_id = p.id
                WHERE iv.venda_id = ?`;

            connection.query(queryItens, [id], (error, itens) => {
                if (error) {
                    console.error('Erro ao buscar itens:', error);
                    return res.status(500).json({ error: 'Erro ao buscar itens' });
                }

                const vendaCompleta = {
                    id: vendas[0].id,
                    data: vendas[0].data,
                    total: vendas[0].total,
                    formaPagamento: vendas[0].forma_pagamento,
                    valorPago: vendas[0].valor_pago,
                    itens: itens.map(item => ({
                        produto: {
                            id: item.produto_id,
                            nome: item.produto_nome,
                            preco: item.produto_preco
                        },
                        quantidade: item.quantidade,
                        subtotal: item.subtotal
                    }))
                };

                console.log('Venda formatada:', vendaCompleta); // Debug
                res.json(vendaCompleta);
            });
        });
    } catch (error) {
        console.error('Erro geral:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
},

    cancelarVenda: async (req, res) => {
        try {
            const { id } = req.params;
            
            await new Promise((resolve, reject) => {
                const query = 'UPDATE vendas SET status = "cancelada" WHERE id = ?';
                connection.query(query, [id], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            res.json({ message: 'Venda cancelada com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = vendasController;