const express = require('express');
const routes = require('./routes');

const app = express();
const db = require('./config/db');

app.use(express.json());

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ 
      status: 'Conectado ao banco!', 
      hora_no_banco: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      erro: 'Falha ao conectar no banco', 
      detalhes: error.message 
    });
  }
});

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'API online' });
});

// Carrega todas as rotas do projeto
app.use('/api', routes);

module.exports = app;