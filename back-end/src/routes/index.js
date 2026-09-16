const { Router } = require('express');
const pescaRoutes = require('./pescaRoutes');
const financeiroRoutes = require('./financeiroRoutes');
const pescadorRoutes = require('./pescadorRoutes');
// const authRoutes = require('./authRoutes'); // Adicionar quando o login estiver pronto

const router = Router();

router.use('/pesca', pescaRoutes);
router.use('/financeiro', financeiroRoutes);
router.use('/pescadores', pescadorRoutes);
// router.use('/auth', authRoutes);  // Adicionar quando o login estiver pronto

module.exports = router;