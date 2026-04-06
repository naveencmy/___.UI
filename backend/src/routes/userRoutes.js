const router = require('express').Router()
const controller = require('../controllers/userController')
const auth = require('../middleware/authMiddleware')
const role = require('../middleware/roleMiddleware')

router.get('/', auth, role('owner'), controller.getUsers)
router.post('/', auth, role('owner'), controller.createUser)
router.put('/:id', auth, role('owner'), controller.updateUser)
router.patch('/:id/toggle', auth, role('owner'), controller.toggleUser)

module.exports = router