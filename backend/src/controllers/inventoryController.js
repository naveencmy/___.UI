const inventoryService = require('../services/inventoryService')

exports.getInventory = async (req,res,next)=>{
  try{
    const data = await inventoryService.getInventory()
    res.json(data)
  }catch(err){
    next(err)
  }
}

exports.getStockMovements = async (req,res,next)=>{
  try{
    const data = await inventoryService.getStockMovements()
    res.json(data)
  }catch(err){
    next(err)
  }
}

exports.getLowStock = async (req,res,next)=>{
  try{
    const data = await inventoryService.getLowStock()
    res.json(data)
  }catch(err){
    next(err)
  }
}

exports.adjustInventory = async (req,res,next)=>{
  try{
    const result = await inventoryService.adjustInventory(
      req.body,
      req.user.id
    )
    res.json(result)
  }catch(err){
    next(err)
  }
}