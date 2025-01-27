const pool = require('./src/db.js');  // Importa a conexão com o banco de dados
const express = require('express');
const router = express.Router();
const userController = require('./src/userController.js');
const ProdutoController = require('./src/produtoController.js');
const vendasController = require('./src/vendasController.js');
const clienteController = require('./src/clienteController.js');
const fornecedorController = require('./src/fornecedorcontroller.js');
const despesasController = require('./src/despesasController');
const contasPagarController = require('./src/contasPagarController');

// API routes
router.get('/api/produtos/busca', ProdutoController.buscarProduto);
router.get('/api/produtos', ProdutoController.listar);
router.post('/api/produtos', ProdutoController.criar);
router.delete('/api/produtos/:id', ProdutoController.deletar);
router.put('/api/produtos/:id', ProdutoController.atualizar);

//rotas usuarios
router.post('/api/users/register', userController.register);
router.post('/api/users/login', userController.login);

// Novas rotas de estoque
router.get('/api/produtos/:id/estoque', ProdutoController.verificarEstoque);
router.put('/api/produtos/:id/estoque', ProdutoController.atualizarEstoque);
router.put('/api/produtos/:id/estoque/devolver', ProdutoController.devolverAoEstoque);

// Rotas de caixa existentes
router.post('/api/caixa/abrir', vendasController.abrirCaixa);
router.post('/api/vendas', vendasController.registrarVenda);
router.post('/api/caixa/fechar', vendasController.fecharCaixa);

// Novas rotas para histórico e cancelamento
router.get('/api/vendas/dia', vendasController.getVendasDia);
router.get('/api/vendas/mes', vendasController.getVendasMes);
router.get('/api/vendas/:id', vendasController.getVendaById);
router.post('/api/vendas/:id/cancelar', vendasController.cancelarVenda);

// Novas rotas para clientes
router.get('/api/clientes', clienteController.listar);
router.post('/api/clientes', clienteController.criar);
router.get('/api/clientes/:id', clienteController.buscarPorId);
router.put('/api/clientes/:id', clienteController.atualizar);
router.delete('/api/clientes/:id', clienteController.deletar);

router.get('/api/fornecedores', fornecedorController.listar);
router.post('/api/fornecedores', fornecedorController.criar);
router.get('/api/fornecedores/:id', fornecedorController.buscarPorId);
router.put('/api/fornecedores/:id', fornecedorController.atualizar);
router.delete('/api/fornecedores/:id', fornecedorController.deletar);

router.get('/api/despesas', despesasController.listar);
router.post('/api/despesas', despesasController.criar);
router.put('/api/despesas/:id', despesasController.atualizar);
router.delete('/api/despesas/:id', despesasController.deletar);


// Rotas para contas a pagar
router.get('/api/contas-pagar', contasPagarController.listar);
router.post('/api/contas-pagar', contasPagarController.criar);
router.put('/api/contas-pagar/:id', contasPagarController.atualizar);
router.delete('/api/contas-pagar/:id', contasPagarController.deletar);
router.get('/cadastro', (req, res) => {
    res.sendFile('cadastro.html', { root: './public' });
});

router.get('/login', (req, res) => {
    res.sendFile('login.html', { root: './public' });
});

// Rotas HTML para fornecedores
router.get('/cadastroDeFornecedores', (req, res) => {
    res.sendFile('cadastroDeFornecedores.html', { root: './public' });
});
router.get('/listaDeFornecedores', (req, res) => {
    res.sendFile('listaDeFornecedores.html', { root: './public' });
});

// HTML routes
router.get('/produtos', (req, res) => {
    res.sendFile('produtos.html', { root: './public' });
});
router.get('/caixa', (req, res) => {
    res.sendFile('caixa.html', { root: './public' });
});
router.get('/historico', (req, res) => {
    res.sendFile('historico.html', { root: './public' });
});
// HTML routes
router.get('/cadastroDeClientes', (req, res) => {
    res.sendFile('cadastroDeClientes.html', { root: './public' });
});
router.get('/listaDeClientes', (req, res) => {
    res.sendFile('listaDeClientes.html', { root: './public' });
});

// Rota HTML
router.get('/despesas', (req, res) => {
    res.sendFile('despesas.html', { root: './public' });
});

router.get('/contas-pagar', (req, res) => {
    res.sendFile('contasPagar.html', { root: './public' });
});router.get('/relatorios', (req, res) => {
    res.sendFile('relatorios.html', { root: './public' });
});

router.get('/api/aniversariantes-do-dia', async (req, res) => {
    try {
        const query = `SELECT * FROM clientes 
            WHERE DATE_FORMAT(dataNascimento, '%m-%d') = DATE_FORMAT(CURRENT_DATE, '%m-%d')`;

        pool.query(query, (error, results) => {
            if (error) {
                console.error('Erro:', error);
                return res.status(500).json({ error: 'Erro ao buscar aniversariantes' });
            }
            res.json(results || []);
        });
    } catch (error) {
        console.error('Erro ao buscar aniversariantes:', error);
        res.status(500).json({ error: 'Erro ao buscar aniversariantes' });
    }
});
router.get('/api/relatorios/produtos-mais-vendidos', (req, res) => {
    const { mes, ano } = req.query;
    let query = `SELECT p.nome, SUM(i.quantidade) as total_vendido, SUM(i.subtotal) as valor_total_vendas 
                 FROM itens_venda i 
                 JOIN produtos p ON i.produto_id = p.id 
                 JOIN vendas v ON i.venda_id = v.id 
                 WHERE v.cancelada = 0`;
    
    if (mes && ano) {
        query += ` AND MONTH(v.data) = ${mes} AND YEAR(v.data) = ${ano}`;
    }
    
    query += ` GROUP BY p.nome`;
    
    pool.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: results });
    });
});
module.exports = router;