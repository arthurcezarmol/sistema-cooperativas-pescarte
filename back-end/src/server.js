/* import express from 'express';

const app = express();
app.use(express.json());
app.use(cors());        // Configurando o CORS para permitir que o front end faça requisições para o back end

// Criando um novo usuário (POST)
app.post('/usuarios', async (req, res) => {

    res.status(201).json({ message: 'Usuário criado com sucesso!' });
});

app.listen(3000); */

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});