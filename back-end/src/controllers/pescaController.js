const { pool } = require('../config/db');

// POST /api/pesca/pescarias -> Inicia um desembarque/jornada
exports.criarPescaria = async (req, res) => {
  const { pescador_id, data_pescaria, observacoes } = req.body;

  if (!pescador_id) {
    return res.status(400).json({ erro: 'O campo pescador_id é obrigatório.' });
  }

  try {
    const query = `
      INSERT INTO pescarias (pescador_id, data_pescaria, observacoes)
      VALUES ($1, COALESCE($2, CURRENT_DATE), $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [pescador_id, data_pescaria || null, observacoes]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar pescaria:', error);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar pescaria.' });
  }
};

// POST /api/pesca/capturas -> Cadastra o peixe e gera o CRÉDITO financeiro
exports.cadastrarItemCaptura = async (req, res) => {
  const { 
    pescaria_id, 
    especie_id, 
    quantidade = 1, 
    peso_kg, 
    tamanho_cm, 
    preco_unitario_kg 
  } = req.body;

  if (!pescaria_id || !especie_id || peso_kg == null || preco_unitario_kg == null) {
    return res.status(400).json({ 
      erro: 'pescaria_id, especie_id, peso_kg e preco_unitario_kg são obrigatórios.' 
    });
  }

  // Usamos um cliente dedicado do pool para garantir a transação atômica
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Descobre o pescador_id a partir da pescaria
    const pescariaRes = await client.query(
      'SELECT pescador_id FROM pescarias WHERE id = $1',
      [pescaria_id]
    );

    if (pescariaRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: 'Pescaria informada não existe.' });
    }

    const pescador_id = pescariaRes.rows[0].pescador_id;

    // 2. Insere o item capturado
    const insertCapturaQuery = `
      INSERT INTO itens_captura 
        (pescaria_id, especie_id, quantidade, peso_kg, tamanho_cm, preco_unitario_kg)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const capturaRes = await client.query(insertCapturaQuery, [
      pescaria_id,
      especie_id,
      quantidade,
      peso_kg,
      tamanho_cm || null,
      preco_unitario_kg
    ]);
    const itemCaptura = capturaRes.rows[0];

    // 3. Registra o CRÉDITO na conta do pescador (com o valor_total gerado)
    const insertTransacaoQuery = `
      INSERT INTO transacoes_financeiras 
        (pescador_id, item_captura_id, tipo, categoria, valor, descricao)
      VALUES ($1, $2, 'CREDITO', 'CAPTURA', $3, $4);
    `;
    const descricao = `Venda ref. Captura #${itemCaptura.id}`;
    await client.query(insertTransacaoQuery, [
      pescador_id,
      itemCaptura.id,
      itemCaptura.valor_total,
      descricao
    ]);

    await client.query('COMMIT');
    return res.status(201).json(itemCaptura);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao cadastrar captura e gerar transação:', error);
    return res.status(500).json({ erro: 'Erro ao processar captura no banco.' });
  } finally {
    client.release();
  }
};

// GET /api/pesca/especies -> Lista espécies disponíveis
exports.listarEspecies = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM especies ORDER BY nome_comum ASC');
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao listar espécies:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar espécies.' });
  }
};

// POST /api/pesca/desembarque -> Cadastra pescaria + itens de uma vez só
exports.cadastrarDesembarqueCompleto = async (req, res) => {
  // Pega o ID do pescador logado automaticamente pelo middleware
  const pescador_id = req.usuarioLogado.id;
  const { data_pescaria, observacoes, capturas } = req.body;

  // capturas deve ser um array: [{ especie_id: 1, quantidade: 2, peso_kg: 10.5, preco_unitario_kg: 30 }]
  if (!capturas || !Array.isArray(capturas) || capturas.length === 0) {
    return res.status(400).json({ erro: 'Envie pelo menos um item capturado.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Cria a pescaria vinculada ao pescador atual
    const pescariaQuery = `
      INSERT INTO pescarias (pescador_id, data_pescaria, observacoes)
      VALUES ($1, COALESCE($2, CURRENT_DATE), $3)
      RETURNING *;
    `;
    const pescariaRes = await client.query(pescariaQuery, [
      pescador_id, 
      data_pescaria || null, 
      observacoes
    ]);
    const novaPescaria = pescariaRes.rows[0];

    // 2. Insere os peixes capturados e gera os créditos no livro-razão
    const itensCadastrados = [];
    let valorTotalFaturado = 0;

    for (const item of capturas) {
      const { especie_id, quantidade = 1, peso_kg, tamanho_cm, preco_unitario_kg } = item;

      // Inserção da captura
      const capturaQuery = `
        INSERT INTO itens_captura 
          (pescaria_id, especie_id, quantidade, peso_kg, tamanho_cm, preco_unitario_kg)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const itemRes = await client.query(capturaQuery, [
        novaPescaria.id,
        especie_id,
        quantidade,
        peso_kg,
        tamanho_cm || null,
        preco_unitario_kg
      ]);
      const itemCriado = itemRes.rows[0];
      itensCadastrados.push(itemCriado);

      valorTotalFaturado += Number(itemCriado.valor_total);

      // Inserção do crédito individual no livro-razão
      const transacaoQuery = `
        INSERT INTO transacoes_financeiras 
          (pescador_id, item_captura_id, tipo, categoria, valor, descricao)
        VALUES ($1, $2, 'CREDITO', 'CAPTURA', $3, $4);
      `;
      await client.query(transacaoQuery, [
        pescador_id,
        itemCriado.id,
        itemCriado.valor_total,
        `Venda ref. Captura #${itemCriado.id}`
      ]);
    }

    await client.query('COMMIT');

    return res.status(201).json({
      mensagem: 'Pescaria e financeiro registrados com sucesso!',
      pescaria: novaPescaria,
      faturamento_total: valorTotalFaturado,
      itens: itensCadastrados
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao cadastrar desembarque:', error);
    return res.status(500).json({ erro: 'Erro ao processar o registro da pescaria.' });
  } finally {
    client.release();
  }
};

// GET /api/pesca/pescarias -> Retorna o histórico apenas do pescador atual
exports.listarMinhasPescarias = async (req, res) => {
  const pescador_id = req.usuarioLogado.id;

  try {
    const query = `
      SELECT 
        p.id AS pescaria_id,
        p.data_pescaria,
        p.observacoes,
        COUNT(ic.id) AS total_itens,
        COALESCE(SUM(ic.peso_kg), 0)::FLOAT AS peso_total_kg,
        COALESCE(SUM(ic.valor_total), 0)::FLOAT AS faturamento_total
      FROM pescarias p
      LEFT JOIN itens_captura ic ON ic.pescaria_id = p.id
      WHERE p.pescador_id = $1
      GROUP BY p.id
      ORDER BY p.data_pescaria DESC;
    `;
    const { rows } = await pool.query(query, [pescador_id]);
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao listar pescarias:', error);
    return res.status(500).json({ erro: 'Erro ao buscar o histórico do pescador.' });
  }
};