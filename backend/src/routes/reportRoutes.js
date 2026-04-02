const express = require('express')
const router = express.Router()

const reportController = require('../controllers/reportController')
const auth = require('../middleware/authMiddleware')

router.get('/dashboard', auth, reportController.getDashboard)
router.get('/sales', auth, reportController.getSalesReport)
router.get('/top-products', auth, reportController.getTopProducts)
router.get('/inventory-value', auth, reportController.getInventoryValue)
router.get('/receivables', auth, reportController.getReceivables)
router.get('/sales/export',auth,reportController.exportSalesReport)
module.exports = router