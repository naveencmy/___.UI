const db = require('../config/db')
const salesRepo = require('../repositories/salesRepository')

exports.createSale = async (data,userId)=>{
  const client = await db.connect()
  try{
    await client.query("BEGIN")
    const invoice = await salesRepo.insertInvoice(
      client,
      data,
      userId
    )
    const invoiceId = invoice.id
    for(const item of data.items){
      const stock = await salesRepo.getStockForUpdate(
        client,
        item.product_unit_id
      )
      if(!stock || stock.quantity < item.quantity){
        throw new Error("Insufficient stock")
      }
      await salesRepo.insertInvoiceItem(
        client,
        invoiceId,
        item
      )
      await salesRepo.reduceInventory(
        client,
        item.product_unit_id,
        item.quantity
      )
      await salesRepo.insertStockMovement(
        client,
        item.product_unit_id,
        -item.quantity,
        'sale',
        invoiceId
      )
    }
    for(const pay of data.payments){
      await salesRepo.insertPayment(
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