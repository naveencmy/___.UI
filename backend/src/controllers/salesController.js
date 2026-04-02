const salesService = require('../services/salesService')

exports.createSale = async (req,res,next)=>{
  try{
    const sale = await salesService.createSale(
      req.body,
      req.user.id
    )
    res.json(sale)
  }catch(err){
    next(err)
  }
}

exports.getSaleById = async (req,res,next)=>{
  try{
    const sale = await salesService.getSaleById(req.params.id)
    res.json(sale)
  }catch(err){
    next(err)
  }
}

exports.returnSale = async (req,res,next)=>{
  try{
    const result = await salesService.returnSale(
      req.body,
      req.user.id
    )
    res.json(result)
  }catch(err){
    next(err)
  }
}