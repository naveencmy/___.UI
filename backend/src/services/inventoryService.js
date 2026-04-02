const db = require('../config/db')
const inventoryRepo = require('../repositories/inventoryRepository')

exports.getInventory = async ()=>{
  return inventoryRepo.getInventory()
}

exports.getStockMovements = async ()=>{
  return inventoryRepo.getStockMovements()
}

exports.getLowStock = async ()=>{
  return inventoryRepo.getLowStock()
}

exports.adjustInventory = async (data,userId)=>{
  const client = await db.connect()
  try{
    await client.query("BEGIN")
    const adjustment =
      await inventoryRepo.insertAdjustment(
        client,
        data,
        userId
      )
    await inventoryRepo.updateInventory(
      client,
      data.product_unit_id,
      data.quantity_change
    )
    await inventoryRepo.insertStockMovement(
      client,
      data.product_unit_id,
      data.quantity_change,
      'adjustment',
      adjustment.id
    )
    await client.query("COMMIT")
    return adjustment
  }catch(err){
    await client.query("ROLLBACK")
    throw err
  }finally{
    client.release()
  }
}