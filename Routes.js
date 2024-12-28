const express = require('express');
const router = express.Router();
const produtoController = require('./src/produtocontrolle.js');
const vendasController = require('./src/vendasController.js');

// API routes
router.get('/api/produtos/busca', produtoController.buscarProduto);
router.get('/api/produtos', produtoController.listar);
router.post('/api/produtos', produtoController.criar);
router.delete('/api/produtos/:id', produtoController.deletar);
router.put('/api/produtos/:id', produtoController.atualizar);

// Rotas de caixa existentes
router.post('/api/caixa/abrir', vendasController.abrirCaixa);
router.post('/api/vendas', vendasController.registrarVenda);
router.post('/api/caixa/fechar', vendasController.fecharCaixa);

// Novas rotas para histórico e cancelamento
router.get('/api/vendas/dia', vendasController.getVendasDia);
router.get('/api/vendas/mes', vendasController.getVendasMes);
router.get('/api/vendas/:id', vendasController.getVendaById);
router.post('/api/vendas/:id/cancelar', vendasController.cancelarVenda);

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

module.exports = router;