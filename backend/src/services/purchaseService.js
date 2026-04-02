const db = require('../config/db')
const purchaseRepo = require('../repositories/purchaseRepository')
const inventoryRepo = require('../repositories/inventoryRepository')

exports.createPurchase = async (data,userId)=>{
  const client = await db.connect()
  try{
    await client.query("BEGIN")
    const invoice =
      await purchaseRepo.insertPurchaseInvoice(
        client,
        data,
        userId
      )
    const invoiceId = invoice.id
    for(const item of data.items){
      await purchaseRepo.insertPurchaseItem(
        client,
        invoiceId,
        item
      )
      await inventoryRepo.updateInventory(
        client,
        item.product_unit_id,
        item.quantity
      )
      await inventoryRepo.insertStockMovement(
        client,
        item.product_unit_id,
        item.quantity,
        'purchase',
        invoiceId
      )
    }
    for(const pay of data.payments){
      await purchaseRepo.insertPayment(
        client,
        invoiceId,
        pay
      )
    }
    await client.query("COMMIT")
    return invoice
  }catch(err){
    await client.query("ROLLBACK")
    throw err
  }finally{
    client.release()
  }
}
exports.getPurchaseById = async(id)=>{
  return purchaseRepo.getPurchaseById(id)
}