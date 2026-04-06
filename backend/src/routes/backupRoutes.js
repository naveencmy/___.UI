const router = require('express').Router()
const controller = require('../controllers/backupController')
const auth = require('../middleware/authMiddleware')
const role = require('../middleware/roleMiddleware')

router.post('/create', auth, role('owner'), controller.backup)
router.post('/restore', auth, role('owner'), controller.restore)

module.exports = router