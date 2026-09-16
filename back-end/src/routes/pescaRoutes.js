const { Router } = require('express');
const pescaController = require('../controllers/pescaController');
const authMock = require('../middlewares/authMock');

const router = Router();

// Aplica a autenticação simulada em todas as rotas deste arquivo
router.use(authMock);

router.post('/desembarque', pescaController.cadastrarDesembarqueCompleto);
router.post('/pescarias', pescaController.criarPescaria);
router.get('/pescarias', pescaController.listarMinhasPescarias);
router.post('/capturas', pescaController.cadastrarItemCaptura);
router.get('/especies', pescaController.listarEspecies);

module.exports = router;