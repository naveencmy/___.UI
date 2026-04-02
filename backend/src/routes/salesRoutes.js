const express = require('express')
const router = express.Router()

const salesController = require('../controllers/salesController')
const auth = require('../middleware/authMiddleware')
router.post('/create', auth, salesController.createSale)
router.get('/:id', auth, salesController.getSaleById)
router.post('/return', auth, salesController.returnSale)
module.exports = router