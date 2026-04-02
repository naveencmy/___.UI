const express = require('express')
const router = express.Router()

const purchaseController =
require('../controllers/purchaseController')

const auth = require('../middleware/authMiddleware')

router.post('/create',auth,purchaseController.createPurchase)
router.get('/:id',auth,purchaseController.getPurchaseById)

module.exports = router