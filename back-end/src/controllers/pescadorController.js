// src/controllers/usuarioController.js
const db = require('../config/db');

exports.criarPescador = async (req, res) => {
  // 1. Extrair os dados da requisição
  const { nome, senha, funcao, cidade_residencia, endereco, telefone } = req.body;

  // 2. Validação simples
  if (!nome || !senha) {
    return res.status(400).json({ 
      erro: 'Nome e senha são obrigatórios.' 
    });
  }

  try {
    // 3. Executar a ação (salvar no PostgreSQL)
    const query = `
      INSERT INTO pescadores (nome, senha, funcao, cidade_residencia, endereco, telefone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nome, funcao, cidade_residencia, endereco, telefone;
    `;
    const values = [nome, senha, funcao, cidade_residencia, endereco, telefone];
    const { rows } = await db.query(query, values);

    // 4. Responder com o status HTTP correto (201 = Criado com sucesso)
    return res.status(201).json(rows[0]);

  } catch (error) {
    // Tratamento de erro (ex: email duplicado)
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Este email já está cadastrado.' });
    }

    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao criar pescador.' });
  }
};

exports.listarPescadores = async (req, res) => {
  try {
    const query = `
      SELECT id, nome, funcao, cidade_residencia, endereco, telefone
      FROM pescadores
      ORDER BY id;
    `;
    const { rows } = await db.query(query);

    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao listar pescadores.' });
  }
};

exports.atualizarPescador = async (req, res) => {
  const { id } = req.params;
  const { nome, senha, funcao, cidade_residencia, endereco, telefone } = req.body;

  if (!nome || !senha) {
    return res.status(400).json({
      erro: 'Nome e senha são obrigatórios.'
    });
  }

  try {
    const query = `
      UPDATE pescadores
      SET nome = $1,
          senha = $2,
          funcao = $3,
          cidade_residencia = $4,
          endereco = $5,
          telefone = $6
      WHERE id = $7
      RETURNING id, nome, funcao, cidade_residencia, endereco, telefone;
    `;
    const values = [nome, senha, funcao, cidade_residencia, endereco, telefone, id];
    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Pescador não encontrado.' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao atualizar pescador.' });
  }
};

exports.excluirPescador = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM pescadores WHERE id = $1 RETURNING id;';
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Pescador não encontrado.' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao excluir pescador.' });
  }
};

