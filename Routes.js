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
const orcamentosController = require('./src/orcamentosController.js');
const { checkAuth } = require('./src/middleware/auth');

// Rotas de autenticação (públicas)
router.post('/api/users/register', userController.register);
router.post('/api/users/login', userController.login);
router.post('/api/users/logout', userController.logout);
router.get('/api/users/verificar', checkAuth, userController.verificarAutenticacao);
// Novos endpoints para verificação e renovação de token
router.post('/api/users/verify-token', userController.verifyToken);
router.post('/api/users/refresh-token', userController.refreshToken);

// Rota para página inicial e login (públicas)
router.get('/', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

router.get('/login', (req, res) => {
    res.sendFile('login.html', { root: './public' });
});

router.get('/cadastro', (req, res) => {
    res.sendFile('cadastro.html', { root: './public' });
});

// Todas as rotas abaixo requerem autenticação
router.use(checkAuth);

// Rota para relatórios
router.get('/relatorios', (req, res) => {
    res.sendFile('relatorios.html', { root: './public' });
});

// Rota de relatórios (protegida)
router.get('/api/relatorios/produtos-mais-vendidos', checkAuth, (req, res) => {
    try {
        const { mes, ano } = req.query;
        
        // Validar os parâmetros
        if (!mes || !ano) {
            return res.status(400).json({ 
                success: false, 
                message: 'Parâmetros mes e ano são obrigatórios' 
            });
        }
        
        // Consulta SQL para MySQL
        const query = `
            SELECT 
                p.nome, 
                SUM(iv.quantidade) as quantidade,
                SUM(iv.subtotal) as valor_total
            FROM 
                itens_venda iv
            JOIN 
                produtos p ON iv.produto_id = p.id
            JOIN 
                vendas v ON iv.venda_id = v.id
            WHERE 
                v.cancelada = 0
                AND MONTH(v.data) = ?
                AND YEAR(v.data) = ?
            GROUP BY 
                p.nome
            ORDER BY 
                quantidade DESC
            LIMIT 50
        `;
        
        // Executar a consulta
        const connection = require('./src/db');
        connection.query(
            query, 
            [parseInt(mes), parseInt(ano)], 
            (err, results) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erro ao buscar produtos mais vendidos'
                    });
                }
                
                // Retorna diretamente os resultados
                res.json(results);
            }
        );
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar produtos mais vendidos'
        });
    }
});

router.get('/api/orcamentos', orcamentosController.listar);
router.post('/api/orcamentos', orcamentosController.criar);
router.get('/api/orcamentos/:id', orcamentosController.buscarPorId);
router.put('/api/orcamentos/:id', orcamentosController.atualizar);
router.delete('/api/orcamentos/:id', orcamentosController.deletar);
router.patch('/api/orcamentos/:id/status', orcamentosController.atualizarStatus);

// Rota para a página HTML
router.get('/orcamentos', (req, res) => {
    res.sendFile('orcamentos.html', { root: './public' });
});
router.get('/listaOrcamentos', (req, res) => {
    res.sendFile('listaOrcamentos.html', { root: './public' });
});
// API routes
router.get('/api/produtos/busca', ProdutoController.buscarProduto);
router.get('/api/produtos', ProdutoController.listar);
router.post('/api/produtos', ProdutoController.criar);
router.delete('/api/produtos/:id', ProdutoController.deletar);
router.put('/api/produtos/:id', ProdutoController.atualizar);

// Novas rotas de estoque
router.get('/api/produtos/:id/estoque', ProdutoController.verificarEstoque);
router.put('/api/produtos/:id/estoque', ProdutoController.atualizarEstoque);
router.put('/api/produtos/:id/estoque/devolver', ProdutoController.devolverAoEstoque);

// Rota para a página de controle de estoque
router.get('/controleEstoque', (req, res) => {
    res.sendFile('controleEstoque.html', { root: './public' });
});

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
// Rotas de aniversariantes desativadas
// router.get('/api/aniversariantes-do-dia', checkAuth, clienteController.aniversariantesDoDia);
// router.get('/api/clientes/aniversariantes/force', checkAuth, (req, res) => {
//     // Obter dia e mês dos parâmetros ou usar 04/03 como padrão
//     const dia = req.query.dia || '04';
//     const mes = req.query.mes || '03';
//     
//     console.log(`Forçando verificação de aniversariantes para ${dia}/${mes}`);
//     
//     // Consulta SQL direta com dia e mês específicos
//     const query = `
//         SELECT * FROM clientes 
//         WHERE DATE_FORMAT(dataNascimento, '%d') = ? 
//         AND DATE_FORMAT(dataNascimento, '%m') = ?
//         ORDER BY nome
//     `;
//     
//     const connection = require('./src/db');
//     connection.query(query, [dia, mes], (err, results) => {
//         if (err) {
//             console.error('Erro ao buscar aniversariantes forçados:', err);
//             return res.status(500).json({ 
//                 success: false, 
//                 message: 'Erro ao buscar aniversariantes forçados' 
//             });
//         }
//         
//         console.log(`Aniversariantes forçados (${dia}/${mes}): ${results.length}`);
//         
//         if (results.length > 0) {
//             results.forEach(cliente => {
//                 console.log(`Cliente aniversariante: ${cliente.nome} - ${cliente.dataNascimento}`);
//             });
//         }
//         
//         res.json(results);
//     });
// });

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

// Rotas HTML para fornecedores
router.get('/cadastroDeFornecedores', (req, res) => {
    res.sendFile('cadastroDeFornecedores.html', { root: './public' });
});
router.get('/listaDeFornecedores', (req, res) => {
    res.sendFile('listaDeFornecedores.html', { root: './public' });
});

// Rotas HTML para clientes
router.get('/cadastroDeClientes', (req, res) => {
    res.sendFile('cadastroDeClientes.html', { root: './public' });
});

router.get('/listaDeClientes', (req, res) => {
    res.sendFile('listaDeClientes.html', { root: './public' });
});

// Rotas para páginas de PDV
router.get('/caixa', (req, res) => {
    res.sendFile('caixa.html', { root: './public' });
});

router.get('/cadastroDeProdutos', (req, res) => {
    res.sendFile('cadastroDeProdutos.html', { root: './public' });
});

// Adicionando Rotas de Páginas Estáticas
router.get('/produtos', (req, res) => {
    res.sendFile('produtos.html', { root: './public' });
});

router.get('/vendas', (req, res) => {
    res.sendFile('vendas.html', { root: './public' });
});

router.get('/historico', (req, res) => {
    res.sendFile('historico.html', { root: './public' });
});

router.get('/despesas', (req, res) => {
    res.sendFile('despesas.html', { root: './public' });
});

router.get('/contasPagar', (req, res) => {
    res.sendFile('contasPagar.html', { root: './public' });
});

// Rota para informações do usuário
router.get('/api/user/info', checkAuth, (req, res) => {
    // Simulação de informações do usuário logado
    res.json({
        id: req.user.id,
        nome: req.user.nome,
        email: req.user.email,
        cargo: req.user.cargo,
        avatar: '/img/default-avatar.png'
    });
});

module.exports = router;