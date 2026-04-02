const express = require('express')
const router = express.Router()

const partyController = require('../controllers/partyController')
const auth = require('../middleware/authMiddleware')
router.get('/', auth, partyController.getParties)
router.get('/:id', auth, partyController.getPartyById)
router.post('/', auth, partyController.createParty)
router.put('/:id', auth, partyController.updateParty)
router.get('/:id/ledger', auth, partyController.getPartyLedger)
module.exports = router