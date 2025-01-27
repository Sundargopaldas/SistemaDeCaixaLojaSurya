const connection = require('./db');

const contasPagarController = {
   listar: async (req, res) => {
       try {
           const query = `
               SELECT cp.*, f.razao_social as fornecedor_nome 
               FROM contas_pagar cp
               LEFT JOIN fornecedores f ON cp.fornecedor_id = f.id
               ORDER BY data_vencimento`;
           
           connection.query(query, (error, results) => {
               if (error) {
                   console.error('Erro ao buscar contas:', error);
                   return res.status(500).json({ error: 'Erro ao buscar contas' });
               }
               res.json(results || []);
           });
       } catch (error) {
           console.error('Erro:', error);
           res.status(500).json({ error: 'Erro interno do servidor' });
       }
   },

  criar: async (req, res) => {
    try {
        console.log('Dados recebidos:', req.body);
        const { fornecedor_id, descricao, valor, data_vencimento, observacoes } = req.body;
        
        const query = `
            INSERT INTO contas_pagar 
            (fornecedor_id, descricao, valor, data_vencimento, observacoes, status) 
            VALUES (?, ?, ?, ?, ?, 'pendente')`;
        
        connection.query(query, 
            [fornecedor_id, descricao, valor, data_vencimento, observacoes], 
            (error, results) => {
                if (error) {
                    console.error('Erro ao criar conta:', error);
                    return res.status(500).json({ 
                        error: 'Erro ao criar conta', 
                        details: error.message 
                    });
                }
                console.log('Conta criada com sucesso:', results);
                res.status(201).json({ 
                    id: results.insertId, 
                    message: 'Conta criada com sucesso' 
                });
            }
        );
    } catch (error) {
        console.error('Erro geral:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        });
    }
},

   atualizar: async (req, res) => {
       const { id } = req.params;
       const { fornecedor_id, descricao, valor, data_vencimento, data_pagamento, status, observacoes } = req.body;
       
       const query = `
           UPDATE contas_pagar 
           SET fornecedor_id = ?, descricao = ?, valor = ?, 
               data_vencimento = ?, data_pagamento = ?, status = ?, 
               observacoes = ?
           WHERE id = ?`;
       
       connection.query(query, 
           [fornecedor_id, descricao, valor, data_vencimento, data_pagamento, status, observacoes, id], 
           (error) => {
               if (error) {
                   console.error('Erro ao atualizar conta:', error);
                   return res.status(500).json({ error: 'Erro ao atualizar conta' });
               }
               res.json({ message: 'Conta atualizada com sucesso' });
           });
   },

   deletar: async (req, res) => {
       const { id } = req.params;
       
       connection.query('DELETE FROM contas_pagar WHERE id = ?', [id], (error) => {
           if (error) {
               console.error('Erro ao deletar conta:', error);
               return res.status(500).json({ error: 'Erro ao deletar conta' });
           }
           res.json({ message: 'Conta deletada com sucesso' });
       });
   },

   porFornecedor: async (req, res) => {
       const { fornecedor_id } = req.params;
       
       const query = `
           SELECT cp.*, f.razao_social as fornecedor_nome 
           FROM contas_pagar cp
           LEFT JOIN fornecedores f ON cp.fornecedor_id = f.id
           WHERE cp.fornecedor_id = ? 
           ORDER BY data_vencimento`;
       
       connection.query(query, [fornecedor_id], (error, results) => {
           if (error) {
               console.error('Erro ao buscar contas do fornecedor:', error);
               return res.status(500).json({ error: 'Erro ao buscar contas do fornecedor' });
           }
           res.json(results || []);
       });
   }
};

function editarConta(id) {
    const conta = todasContas.find(c => c.id === id);
    if (!conta) return;

    // Formatando a data para o formato yyyy-MM-dd
    const data = new Date(conta.data_vencimento);
    const dataFormatada = data.toISOString().split('T')[0];

    document.getElementById('fornecedor').value = conta.fornecedor_id;
    document.getElementById('descricao').value = conta.descricao;
    document.getElementById('valor').value = conta.valor;
    document.getElementById('data_vencimento').value = dataFormatada;
    document.getElementById('observacoes').value = conta.observacoes || '';

    const form = document.getElementById('conta-form');
    form.dataset.modo = 'editar';
    form.dataset.contaId = id;

    // Altera o texto do botão
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Atualizar Conta';

    // Adiciona botão de cancelar se não existir
    if (!document.getElementById('btn-cancelar')) {
        const cancelarBtn = document.createElement('button');
        cancelarBtn.type = 'button';
        cancelarBtn.id = 'btn-cancelar';
        cancelarBtn.className = 'btn btn-cancelar';
        cancelarBtn.textContent = 'Cancelar';
        cancelarBtn.onclick = cancelarEdicao;
        submitButton.parentNode.insertBefore(cancelarBtn, submitButton.nextSibling);
    }
}

function cancelarEdicao() {
    const form = document.getElementById('conta-form');
    form.reset();
    form.dataset.modo = 'criar';
    delete form.dataset.contaId;
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Adicionar Conta';
    
    const cancelarBtn = document.getElementById('btn-cancelar');
    if (cancelarBtn) {
        cancelarBtn.remove();
    }
}

module.exports = contasPagarController;