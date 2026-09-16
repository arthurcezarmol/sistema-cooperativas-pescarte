const { Router } = require('express');
const financeiroController = require('../controllers/financeiroController');

const router = Router();

// Aqui vai a lógica do financeiro, como rotas para criar, ler, atualizar e deletar registros financeiros

router.post('/transacoes', financeiroController.criarTransacaoManual);
router.get('/balanco', financeiroController.obterBalanco);

module.exports = router;