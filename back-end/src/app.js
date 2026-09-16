const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const db = require('./config/db');

app.use(cors()); // Libera o acesso para o front-end
app.use(express.json());
app.use('/api', routes);  // Carrega todas as rotas do projeto

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

module.exports = app;