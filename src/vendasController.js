const { Venda, Caixa } = require('../public/js/vendas');
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
        
        console.log('Dados da venda:', { itens, formaPagamento, valorPago });

        // Primeiro, insere a venda
        const result = await new Promise((resolve, reject) => {
            const query = 'INSERT INTO vendas (data, total, forma_pagamento, valor_pago) VALUES (NOW(), 0, ?, ?)';
            console.log('Executando query:', query);
            connection.query(query, [formaPagamento, valorPago], (err, res) => {
                if (err) {
                    console.error('Erro ao inserir venda:', err);
                    reject(err);
                }
                resolve(res);
            });
        });

        const vendaId = result.insertId;
        console.log('ID da venda criada:', vendaId);
        let totalVenda = 0;

        // Depois, insere cada item
        for (const item of itens) {
    // Buscar produto no banco
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
        throw new Error(`Produto não encontrado: ${item.produtoId}`);
    }

    const subtotal = produto.preco * item.quantidade;
    totalVenda += subtotal;

    await new Promise((resolve, reject) => {
        const query = 'INSERT INTO itens_venda (venda_id, produto_id, quantidade, subtotal) VALUES (?, ?, ?, ?)';
        connection.query(query, [vendaId, item.produtoId, item.quantidade, subtotal], (err) => {
            if (err) {
                console.error('Erro ao inserir item:', err);
                reject(err);
            }
            resolve();
        });
    });
}

        // Atualiza o total da venda
        await new Promise((resolve, reject) => {
            const query = 'UPDATE vendas SET total = ? WHERE id = ?';
            connection.query(query, [totalVenda, vendaId], (err) => {
                if (err) {
                    console.error('Erro ao atualizar total:', err);
                    reject(err);
                }
                resolve();
            });
        });

        console.log('Venda finalizada com sucesso');
        res.json({ 
            id: vendaId,
            total: totalVenda,
            message: 'Venda registrada com sucesso' 
        });
    } catch (error) {
        console.error('Erro ao processar venda:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.fecharCaixa = (req, res) => {
    const fechamento = caixa.fecharCaixa();
    res.json(fechamento);
};

// Adicionando funções de histórico
exports.getVendasDia = async (req, res) => {
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const query = `
            SELECT 
                v.*,
                GROUP_CONCAT(CONCAT(iv.quantidade, 'x ', p.nome) SEPARATOR ', ') as produtos
            FROM vendas v 
            LEFT JOIN itens_venda iv ON v.id = iv.venda_id
            LEFT JOIN produtos p ON iv.produto_id = p.id
            WHERE DATE(v.data) = CURDATE()
            GROUP BY v.id
        `;
        
        connection.query(query, [hoje], (error, results) => {
            if (error) {
                console.error('Erro ao buscar vendas:', error);
                return res.status(500).json({ error: 'Erro ao buscar vendas do dia' });
            }
            
            const vendas = results.map(venda => ({
                id: venda.id,
                data: venda.data,
                produtos: venda.produtos,
                formaPagamento: venda.forma_pagamento,
                total: venda.total,
                cancelada: venda.cancelada
            }));
            
            res.json(vendas);
        });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getVendasMes = async (req, res) => {
    try {
        const query = `
            SELECT 
                DATE(data) as data,
                COUNT(*) as totalVendas,
                SUM(total) as valorTotal
            FROM vendas
            WHERE cancelada = 0
            GROUP BY DATE(data)
            ORDER BY data DESC
        `;
        
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Erro ao buscar vendas:', error);
                return res.status(500).json({ error: 'Erro ao buscar vendas do mês' });
            }
            
            res.json(results);
        });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Função auxiliar para formatar a data
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
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