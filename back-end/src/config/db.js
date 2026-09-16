require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  // Como agora é local, NÃO precisa de ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('Conexão com o PostgreSQL estabelecida!');
  // console.log('Conectado com sucesso ao PostgreSQL no Docker!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};