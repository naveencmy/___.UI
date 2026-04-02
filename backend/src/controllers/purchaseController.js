const purchaseService = require('../services/purchaseService')

exports.createPurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.createPurchase(
      req.body,
      req.user.id
    )
    res.json(purchase)
  } catch (err) {
    next(err)
  }
}
exports.getPurchaseById = async (req, res, next) => {
  try {
    const data = await purchaseService.getPurchaseById(req.params.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
}