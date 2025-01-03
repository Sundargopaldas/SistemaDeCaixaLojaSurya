const express = require('express');
const router = express.Router();
const produtoController = require('./src/produtocontrolle.js');
const vendasController = require('./src/vendasController.js');
const clienteController = require('./src/clienteController.js');
const fornecedorController = require('./src/fornecedorcontroller.js');
// API routes
router.get('/api/produtos/busca', produtoController.buscarProduto);
router.get('/api/produtos', produtoController.listar);
router.post('/api/produtos', produtoController.criar);
router.delete('/api/produtos/:id', produtoController.deletar);
router.put('/api/produtos/:id', produtoController.atualizar);

// Novas rotas de estoque
router.get('/api/produtos/:id/estoque', produtoController.verificarEstoque);
router.put('/api/produtos/:id/estoque', produtoController.atualizarEstoque);
router.put('/api/produtos/:id/estoque/devolver', produtoController.devolverAoEstoque);

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

module.exports = router;