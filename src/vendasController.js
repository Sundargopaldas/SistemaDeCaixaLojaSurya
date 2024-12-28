const { Venda, Caixa } = require('./vendas');
const connection = require('./db');

const caixa = new Caixa();

exports.abrirCaixa = (req, res) => {
    const { saldoInicial } = req.body;
    caixa.abrirCaixa(saldoInicial);
    res.json({ message: 'Caixa aberto com sucesso' });
};

exports.registrarVenda = async (req, res) => {
    try {
        const { itens, formaPagamento, valorPago } = req.body;
        const venda = new Venda();
        
        for (const item of itens) {
            const [produto] = await new Promise((resolve, reject) => {
                connection.query(
                    'SELECT * FROM produtos WHERE id = ?',
                    [item.produtoId],
                    (err, results) => {
                        if (err) reject(err);
                        resolve(results);
                    }
                );
            });
            
            if (!produto) {
                throw new Error(`Produto com ID ${item.produtoId} não encontrado`);
            }
            
            venda.adicionarItem(produto, item.quantidade);
        }
        
        venda.definirPagamento(formaPagamento, valorPago);
        const troco = venda.calcularTroco();
        
        caixa.registrarVenda(venda);
        
        res.json({
            total: venda.total,
            troco,
            message: 'Venda registrada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao registrar venda:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.fecharCaixa = (req, res) => {
    const fechamento = caixa.fecharCaixa();
    res.json(fechamento);
};

// Novos métodos para histórico e cancelamento
exports.getVendasDia = async (req, res) => {
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const query = `
            SELECT v.*, p.nome as produto_nome, p.preco
            FROM vendas v 
            LEFT JOIN itens_venda iv ON v.id = iv.venda_id
            LEFT JOIN produtos p ON iv.produto_id = p.id
            WHERE DATE(v.data) = DATE(?)
        `;
        
        connection.query(query, [hoje], (error, results) => {
            if (error) {
                console.error('Erro ao buscar vendas:', error);
                return res.status(500).json({ error: 'Erro ao buscar vendas do dia' });
            }
            
            // Organiza os resultados agrupando itens por venda
            const vendas = [];
            const vendasMap = new Map();
            
            results.forEach(row => {
                if (!vendasMap.has(row.id)) {
                    vendasMap.set(row.id, {
                        id: row.id,
                        data: row.data,
                        total: row.total,
                        formaPagamento: row.forma_pagamento,
                        cancelada: row.cancelada,
                        itens: []
                    });
                    vendas.push(vendasMap.get(row.id));
                }
                
                if (row.produto_nome) {
                    vendasMap.get(row.id).itens.push({
                        produto: {
                            nome: row.produto_nome,
                            preco: row.preco
                        },
                        quantidade: row.quantidade,
                        subtotal: row.subtotal
                    });
                }
            });
            
            res.json(vendas);
        });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.getVendasMes = async (req, res) => {
    try {
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        
        const query = `
            SELECT v.*, p.nome as produto_nome, p.preco
            FROM vendas v 
            LEFT JOIN itens_venda iv ON v.id = iv.venda_id
            LEFT JOIN produtos p ON iv.produto_id = p.id
            WHERE v.data BETWEEN ? AND ?
        `;
        
        connection.query(query, [primeiroDiaMes, ultimoDiaMes], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Erro ao buscar vendas do mês' });
            }
            
            // Organiza os resultados agrupando por venda
            const vendas = [];
            const vendasMap = new Map();
            
            results.forEach(row => {
                if (!vendasMap.has(row.id)) {
                    vendasMap.set(row.id, {
                        id: row.id,
                        data: row.data,
                        total: row.total,
                        formaPagamento: row.forma_pagamento,
                        cancelada: row.cancelada,
                        itens: []
                    });
                    vendas.push(vendasMap.get(row.id));
                }
                
                if (row.produto_nome) {
                    vendasMap.get(row.id).itens.push({
                        produto: {
                            nome: row.produto_nome,
                            preco: row.preco
                        },
                        quantidade: row.quantidade,
                        subtotal: row.subtotal
                    });
                }
            });
            
            res.json(vendas);
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.getVendaById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT v.*, p.nome as produto_nome, p.preco, iv.quantidade, iv.subtotal
            FROM vendas v 
            LEFT JOIN itens_venda iv ON v.id = iv.venda_id
            LEFT JOIN produtos p ON iv.produto_id = p.id
            WHERE v.id = ?
        `;
        
        connection.query(query, [id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Erro ao buscar venda' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Venda não encontrada' });
            }
            
            // Organiza os resultados em uma única venda com seus itens
            const venda = {
                id: results[0].id,
                data: results[0].data,
                total: results[0].total,
                formaPagamento: results[0].forma_pagamento,
                cancelada: results[0].cancelada,
                itens: []
            };
            
            results.forEach(row => {
                if (row.produto_nome) {
                    venda.itens.push({
                        produto: {
                            nome: row.produto_nome,
                            preco: row.preco
                        },
                        quantidade: row.quantidade,
                        subtotal: row.subtotal
                    });
                }
            });
            
            res.json(venda);
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.cancelarVenda = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verifica se a venda existe e pode ser cancelada
        const checkQuery = 'SELECT * FROM vendas WHERE id = ? AND DATE(data) = CURDATE() AND cancelada = 0';
        
        connection.query(checkQuery, [id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Erro ao verificar venda' });
            }
            
            if (results.length === 0) {
                return res.status(400).json({ 
                    error: 'Venda não pode ser cancelada. Verifique se ela existe, é do dia atual e não foi cancelada anteriormente.' 
                });
            }
            
            // Cancela a venda
            const updateQuery = 'UPDATE vendas SET cancelada = 1 WHERE id = ?';
            
            connection.query(updateQuery, [id], (error) => {
                if (error) {
                    return res.status(500).json({ error: 'Erro ao cancelar venda' });
                }
                
                res.json({ 
                    success: true, 
                    message: 'Venda cancelada com sucesso' 
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};