// src/middlewares/authMock.js
module.exports = (req, res, next) => {
  // Lê o ID do pescador enviado no Header 'x-pescador-id' ou na query string (?pescador_id=1)
  // Se não enviar nenhum, assume o pescador 1 por padrão para facilitar os testes
  const pescadorId = req.headers['x-pescador-id'] || req.query.pescador_id || 1;

  // Injeta o pescador na requisição exatamente como o JWT fará no futuro
  req.usuarioLogado = {
    id: Number(pescadorId)
  };

  next();
};