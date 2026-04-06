const express = require('express')
const router = express.Router()

const controller = require('../controllers/authController')
const auth = require('../middleware/authMiddleware')

router.post('/login', controller.login)
router.get('/me', auth, controller.me)
router.post('/change-password', auth, controller.changePassword)

module.exports = router