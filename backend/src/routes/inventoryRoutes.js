const express = require('express')
const router = express.Router()

const inventoryController = require('../controllers/inventoryController')
const auth = require('../middleware/authMiddleware')
const role = require('../middleware/roleMiddleware')

router.get('/', auth, inventoryController.getInventory)
router.get('/movements', auth, inventoryController.getStockMovements)
router.get('/low-stock', auth, inventoryController.getLowStock)
router.post(
  '/adjust',auth,role('owner'),inventoryController.adjustInventory
)
module.exports = router