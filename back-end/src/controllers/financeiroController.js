const { pool } = require('../config/db');

// POST /api/financeiro/transacoes -> Lançar débitos manuais (combustível, gelo, saque)
exports.criarTransacaoManual = async (req, res) => {
  const { pescador_id, tipo, categoria, valor, descricao } = req.body;

  if (!pescador_id || !tipo || !categoria || !valor) {
    return res.status(400).json({ 
      erro: 'pescador_id, tipo, categoria e valor são obrigatórios.' 
    });
  }

  if (!['CREDITO', 'DEBITO'].includes(tipo)) {
    return res.status(400).json({ erro: 'O campo tipo deve ser CREDITO ou DEBITO.' });
  }

  try {
    const query = `
      INSERT INTO transacoes_financeiras (pescador_id, tipo, categoria, valor, descricao)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [pescador_id, tipo, categoria, valor, descricao || null]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar transação manual:', error);
    return res.status(500).json({ erro: 'Erro interno ao lançar transação financeira.' });
  }
};

// GET /api/financeiro/balanco?pescador_id=ID -> Balanço consolidado e extrato
exports.obterBalanco = async (req, res) => {
  const { pescador_id, data_inicio, data_fim } = req.query;

  if (!pescador_id) {
    return res.status(400).json({ erro: 'O parâmetro pescador_id é obrigatório via query.' });
  }

  try {
    // 1. Totalizadores de Crédito, Débito e Saldo Líquido
    const balancoQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'CREDITO' THEN valor ELSE 0 END), 0)::FLOAT AS total_creditos,
        COALESCE(SUM(CASE WHEN tipo = 'DEBITO' THEN valor ELSE 0 END), 0)::FLOAT AS total_debitos,
        (
          COALESCE(SUM(CASE WHEN tipo = 'CREDITO' THEN valor ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN tipo = 'DEBITO' THEN valor ELSE 0 END), 0)
        )::FLOAT AS saldo_atual
      FROM transacoes_financeiras
      WHERE pescador_id = $1
        AND ($2::TIMESTAMPTZ IS NULL OR data_transacao >= $2::TIMESTAMPTZ)
        AND ($3::TIMESTAMPTZ IS NULL OR data_transacao <= $3::TIMESTAMPTZ);
    `;

    // 2. Extrato recente das movimentações
    const extratoQuery = `
      SELECT id, tipo, categoria, valor::FLOAT, descricao, data_transacao
      FROM transacoes_financeiras
      WHERE pescador_id = $1
        AND ($2::TIMESTAMPTZ IS NULL OR data_transacao >= $2::TIMESTAMPTZ)
        AND ($3::TIMESTAMPTZ IS NULL OR data_transacao <= $3::TIMESTAMPTZ)
      ORDER BY data_transacao DESC
      LIMIT 20;
    `;

    // 3. Faturamento agrupado por espécie de peixe
    const porEspecieQuery = `
      SELECT 
        e.nome_comum,
        SUM(ic.peso_kg)::FLOAT AS total_kg,
        SUM(ic.valor_total)::FLOAT AS total_gerado
      FROM itens_captura ic
      JOIN especies e ON e.id = ic.especie_id
      JOIN pescarias p ON p.id = ic.pescaria_id
      WHERE p.pescador_id = $1
        AND ($2::DATE IS NULL OR p.data_pescaria >= $2::DATE)
        AND ($3::DATE IS NULL OR p.data_pescaria <= $3::DATE)
      GROUP BY e.nome_comum
      ORDER BY total_gerado DESC;
    `;

    const params = [pescador_id, data_inicio || null, data_fim || null];

    const [balancoRes, extratoRes, especieRes] = await Promise.all([
      pool.query(balancoQuery, params),
      pool.query(extratoQuery, params),
      pool.query(porEspecieQuery, params)
    ]);

    return res.json({
      resumo_financeiro: balancoRes.rows[0],
      extrato_recente: extratoRes.rows,
      producao_por_especie: especieRes.rows
    });
  } catch (error) {
    console.error('Erro ao calcular balanço:', error);
    return res.status(500).json({ erro: 'Erro interno ao consultar balanço.' });
  }
};