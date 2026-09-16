// Configuração do Axios com baseURL e headers
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // URL base da API
  headers: {
    'Content-Type': 'application/json', // Tipo de conteúdo padrão
    'x-pescador-id': '1' // Pescador simulado para testes
  }
});

export default api;