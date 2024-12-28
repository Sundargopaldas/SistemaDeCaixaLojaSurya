const connection = require('./db.js');

const ProdutoController = {
  listar(req, res) {
      connection.query(
          'SELECT p.*, c.nome as categoria FROM produtos p JOIN categorias c ON p.categoria_id = c.id',
          (err, results) => {
              if (err) return res.status(500).json(err);
              res.json(results);
          }
      );
  },

  criar(req, res) {
      const { nome, preco, estoque, categoria_id } = req.body;
      connection.query(
          'INSERT INTO produtos (nome, preco, estoque, categoria_id) VALUES (?, ?, ?, ?)',
          [nome, preco, estoque, categoria_id],
          (err, result) => {
              if (err) return res.status(500).json(err);
              res.status(201).json({
                  id: result.insertId,
                  nome,
                  preco,
                  estoque,
                  categoria_id
              });
          }
      );
  },

  deletar(req, res) {
      const id = req.params.id;
      connection.query(
          'DELETE FROM produtos WHERE id = ?',
          [id],
          (err, result) => {
              if (err) return res.status(500).json(err);
              res.json({ message: 'Produto deletado' });
          }
      );
  },

  atualizar(req, res) {
      const { nome, preco, estoque, categoria_id } = req.body;
      const id = req.params.id;
      connection.query(
          'UPDATE produtos SET nome = ?, preco = ?, estoque = ?, categoria_id = ? WHERE id = ?',
          [nome, preco, estoque, categoria_id, id],
          (err, result) => {
              if (err) return res.status(500).json(err);
              res.json({ id, nome, preco, estoque, categoria_id });
          }
      );
  },

 buscarProduto(req, res) {
    const { termo } = req.query;
    console.log('Termo buscado:', termo); // Debug do termo
    connection.query(
        'SELECT * FROM produtos WHERE nome LIKE ?',
        [`%${termo}%`],
        (err, results) => {
            console.log('Erro:', err); // Debug de erro
            console.log('Resultados:', results); // Debug dos resultados
            if (err) return res.status(500).json(err);
            res.json(results);
          }
      );
  }
};

module.exports = ProdutoController;