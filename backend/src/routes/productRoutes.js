const express = require('express')
const router = express.Router()

const productController = require('../controllers/productController')
const auth = require('../middleware/authMiddleware')
router.get('/', auth, productController.getProducts)
router.get('/search', auth, productController.searchProducts)
router.get('/barcode/:code', auth, productController.getProductByBarcode)
router.post('/', auth, productController.createProduct)
router.put('/:id', auth, productController.updateProduct)
router.delete('/:id', auth, productController.deleteProduct)
module.exports = router