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
            // Extrair dados da requisição
            const { itens, formaPagamento, valorPago, total } = req.body;
            
            // Log detalhado dos dados recebidos
            console.log("Dados da venda recebidos:", {
                formaPagamento,
                valorPago,
                total,
                itensCount: itens ? itens.length : 0
            });
            
            // Calcular quantidade total explicitamente
            let quantidadeTotal = 0;
            let totalCalculado = 0;
            
            // Verificar se itens é válido
            if (!itens || !Array.isArray(itens) || itens.length === 0) {
                console.log("Alerta: Venda sem itens detectada");
                // Mesmo sem itens, garantir que pelo menos tenha uma quantidade de 1
                quantidadeTotal = 1;
            } else {
                for (const item of itens) {
                    const qtd = parseInt(item.quantidade || 0);
                    quantidadeTotal += qtd;
                    
                    // Calcular o total
                    const preco = parseFloat(item.preco_unitario || item.preco || 0);
                    totalCalculado += qtd * preco;
                }
            }
            
            // Usar o total fornecido ou o calculado
            const totalFinal = parseFloat(total) || totalCalculado || 0;
            console.log("Quantidade total calculada:", quantidadeTotal, "Total final:", totalFinal);
            
            // Criar um objeto Date para a data atual
            const now = new Date();
            
            // Formatar a data no formato MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
            // Importante: adicionar padding (com 0) em todos os componentes numéricos
            const ano = now.getFullYear();
            const mes = String(now.getMonth() + 1).padStart(2, '0');
            const dia = String(now.getDate()).padStart(2, '0');
            const hora = String(now.getHours()).padStart(2, '0');
            const minuto = String(now.getMinutes()).padStart(2, '0');
            const segundo = String(now.getSeconds()).padStart(2, '0');
            
            const dataFormatada = `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
            console.log("Data formatada para inserção:", dataFormatada);
            
            // Inserir a venda principal com a quantidade total e data explícita
            const result = await new Promise((resolve, reject) => {
                const query = 'INSERT INTO vendas (data, total, forma_pagamento, valor_pago, quantidade_total) VALUES (?, ?, ?, ?, ?)';
                connection.query(query, [dataFormatada, totalFinal, formaPagamento, valorPago || 0, quantidadeTotal], (err, res) => {
                    if (err) {
                        console.error("Erro ao inserir venda:", err);
                        reject(err);
                    }
                    resolve(res);
                });
            });

            const vendaId = result.insertId;
            
            // Inserir cada item da venda apenas se existirem itens
            if (itens && Array.isArray(itens) && itens.length > 0) {
                for (const item of itens) {
                    const quantidade = parseInt(item.quantidade || 0);
                    
                    // Usar o preço unitário correto, dependendo da estrutura do item
                    const preco = parseFloat(item.preco_unitario || item.preco || 0);
                    const subtotal = quantidade * preco;
                    
                    // Usar o id do produto correto, dependendo da estrutura do item
                    const produtoId = item.produto_id || item.produtoId;
                    
                    if (!produtoId) {
                        console.error("ERRO: Item sem ID de produto:", item);
                        continue; // Pular este item
                    }

                    await new Promise((resolve, reject) => {
                        const query = 'INSERT INTO itens_venda (venda_id, produto_id, quantidade, subtotal) VALUES (?, ?, ?, ?)';
                        connection.query(query, [vendaId, produtoId, quantidade, subtotal], (err) => {
                            if (err) {
                                console.error("Erro ao inserir item:", err);
                                reject(err);
                            }
                            resolve();
                        });
                    });
                }
            } else {
                console.log("Venda #" + vendaId + " criada sem itens.");
            }

            // Atualizar o total da venda e confirmar a quantidade total
            await new Promise((resolve, reject) => {
                const query = 'UPDATE vendas SET total = ?, quantidade_total = ? WHERE id = ?';
                connection.query(query, [totalFinal, quantidadeTotal, vendaId], (err) => {
                    if (err) {
                        console.error("Erro ao atualizar totais:", err);
                        reject(err);
                    }
                    resolve();
                });
            });

            res.json({ message: 'Venda registrada com sucesso', id: vendaId });
        } catch (error) {
            console.error('Erro ao registrar venda:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getVendasDia: async (req, res) => {
        try {
            // Obter a data do parâmetro ou usar a data atual
            const dataParam = req.query.data || new Date().toISOString().split('T')[0];
            console.log("Buscando vendas para a data:", dataParam);
            
            const query = `
                SELECT 
                    v.id,
                    DATE_FORMAT(v.data, '%Y-%m-%d %H:%i:%s') as data_formatada,
                    v.data,
                    v.total,
                    v.forma_pagamento,
                    v.valor_pago,
                    v.cancelada,
                    GROUP_CONCAT(p.nome SEPARATOR ', ') as produtos,
                    COALESCE(v.quantidade_total, (SELECT SUM(iv2.quantidade) FROM itens_venda iv2 WHERE iv2.venda_id = v.id)) as quantidade_total
                FROM vendas v
                LEFT JOIN itens_venda iv ON v.id = iv.venda_id
                LEFT JOIN produtos p ON iv.produto_id = p.id
                WHERE DATE(v.data) = ?
                GROUP BY v.id, v.data, v.total, v.forma_pagamento, v.valor_pago, v.cancelada
                ORDER BY v.data DESC
            `;
            
            connection.query(query, [dataParam], (error, results) => {
                if (error) {
                    console.error("Erro na consulta de vendas:", error);
                    throw error;
                }
                
                // Processar os resultados para garantir datas válidas
                const vendasProcessadas = results.map(venda => {
                    // Usar a data formatada para evitar problemas
                    return {
                        ...venda,
                        // Garantir que a data esteja em um formato consistente
                        data: venda.data_formatada || venda.data,
                        // Garantir valores numéricos
                        total: parseFloat(venda.total || 0),
                        quantidade_total: parseInt(venda.quantidade_total || 0) || 1 // Pelo menos 1 item
                    };
                });
                
                console.log(`Vendas recuperadas: ${vendasProcessadas.length}`, 
                           vendasProcessadas.length > 0 ? 
                           `Exemplo da primeira venda: ${JSON.stringify(vendasProcessadas[0])}` : 
                           "Nenhuma venda encontrada");
                
                res.json(vendasProcessadas);
            });
        } catch (error) {
            console.error("Erro geral em getVendasDia:", error);
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
            console.log(`Buscando detalhes da venda ID: ${id}`);
            
            // Primeiro busca a venda usando DATE_FORMAT para garantir datas corretas
            const queryVenda = `
                SELECT 
                    id,
                    DATE_FORMAT(data, '%Y-%m-%d %H:%i:%s') as data_formatada,
                    data,
                    total,
                    forma_pagamento,
                    valor_pago,
                    quantidade_total,
                    cancelada
                FROM vendas 
                WHERE id = ?
            `;

            connection.query(queryVenda, [id], (error, vendas) => {
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

                    // Garantir valores numéricos e datas corretas
                    const vendaCompleta = {
                        id: vendas[0].id,
                        // Usar a data formatada pelo MySQL
                        data: vendas[0].data_formatada || vendas[0].data,
                        total: parseFloat(vendas[0].total || 0),
                        formaPagamento: vendas[0].forma_pagamento,
                        valorPago: parseFloat(vendas[0].valor_pago || 0),
                        quantidade_total: parseInt(vendas[0].quantidade_total || 0) || 1,
                        cancelada: vendas[0].cancelada,
                        itens: itens.map(item => ({
                            produto: {
                                id: item.produto_id,
                                nome: item.produto_nome,
                                preco: parseFloat(item.produto_preco || 0)
                            },
                            quantidade: parseInt(item.quantidade || 0),
                            subtotal: parseFloat(item.subtotal || 0)
                        }))
                    };

                    console.log(`Venda completa recuperada: ${JSON.stringify(vendaCompleta)}`);
                    res.json(vendaCompleta);
                });
            });
        } catch (error) {
            console.error('Erro geral em getVendaById:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    getVendasMes: async (req, res) => {
        try {
            console.log("Buscando vendas do mês atual");
            
            const query = `
                SELECT 
                    v.id,
                    DATE_FORMAT(v.data, '%Y-%m-%d %H:%i:%s') as data_formatada,
                    v.data,
                    v.total,
                    v.forma_pagamento,
                    v.valor_pago,
                    v.cancelada,
                    GROUP_CONCAT(p.nome SEPARATOR ', ') as produtos,
                    COALESCE(v.quantidade_total, (SELECT SUM(iv2.quantidade) FROM itens_venda iv2 WHERE iv2.venda_id = v.id)) as quantidade_total
                FROM vendas v
                LEFT JOIN itens_venda iv ON v.id = iv.venda_id
                LEFT JOIN produtos p ON iv.produto_id = p.id
                WHERE MONTH(v.data) = MONTH(CURDATE())
                AND YEAR(v.data) = YEAR(CURDATE())
                GROUP BY v.id, v.data, v.total, v.forma_pagamento, v.valor_pago, v.cancelada
                ORDER BY v.data DESC
            `;
            
            connection.query(query, (error, results) => {
                if (error) {
                    console.error("Erro na consulta de vendas do mês:", error);
                    throw error;
                }
                
                // Processar os resultados para garantir datas válidas
                const vendasProcessadas = results.map(venda => {
                    return {
                        ...venda,
                        // Garantir que a data esteja em um formato consistente
                        data: venda.data_formatada || venda.data,
                        // Garantir valores numéricos
                        total: parseFloat(venda.total || 0),
                        quantidade_total: parseInt(venda.quantidade_total || 0) || 1 // Pelo menos 1 item
                    };
                });
                
                console.log(`Vendas do mês recuperadas: ${vendasProcessadas.length}`, 
                           vendasProcessadas.length > 0 ? 
                           `Exemplo da primeira venda: ${JSON.stringify(vendasProcessadas[0])}` : 
                           "Nenhuma venda encontrada");
                
                res.json(vendasProcessadas);
            });
        } catch (error) {
            console.error("Erro geral em getVendasMes:", error);
            res.status(500).json({ error: error.message });
        }
    },

    cancelarVenda: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`Solicitado cancelamento da venda #${id}`);
            
            // Primeiro vamos verificar se a venda existe
            const verificaVenda = await new Promise((resolve, reject) => {
                connection.query('SELECT id, data, cancelada FROM vendas WHERE id = ?', [id], (err, results) => {
                    if (err) {
                        console.error(`Erro ao verificar venda #${id}:`, err);
                        reject(err);
                        return;
                    }
                    resolve(results);
                });
            });
            
            if (!verificaVenda || verificaVenda.length === 0) {
                console.error(`Venda #${id} não encontrada para cancelamento`);
                return res.status(404).json({ error: 'Venda não encontrada', success: false });
            }
            
            if (verificaVenda[0].cancelada) {
                console.log(`Venda #${id} já está cancelada`);
                return res.json({ 
                    message: 'Venda já estava cancelada', 
                    id: id,
                    success: true,
                    alreadyCancelled: true
                });
            }
            
            // Agora podemos cancelar a venda
            await new Promise((resolve, reject) => {
                const query = 'UPDATE vendas SET cancelada = 1 WHERE id = ?';
                connection.query(query, [id], (err) => {
                    if (err) {
                        console.error(`Erro ao cancelar venda #${id}:`, err);
                        reject(err);
                        return;
                    }
                    console.log(`Venda #${id} cancelada com sucesso`);
                    resolve();
                });
            });

            res.json({ 
                message: 'Venda cancelada com sucesso', 
                id: id,
                success: true,
                alreadyCancelled: false,
                timestamp: new Date().toISOString() 
            });
        } catch (error) {
            console.error('Erro geral em cancelarVenda:', error);
            res.status(500).json({ 
                error: error.message, 
                success: false,
                timestamp: new Date().toISOString()
            });
        }
    }
};

module.exports = vendasController;