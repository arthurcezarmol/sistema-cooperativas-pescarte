const { Router } = require('express');
const {
	criarPescador,
	listarPescadores,
	atualizarPescador,
	excluirPescador
} = require('../controllers/pescadorController');

const router = Router();

router.post('/', criarPescador);
router.get('/', listarPescadores);
router.put('/:id', atualizarPescador);
router.delete('/:id', excluirPescador);

module.exports = router;