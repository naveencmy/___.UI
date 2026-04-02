const reportService = require('../services/reportService')

exports.getDashboard = async (req,res,next)=>{
  try{
    const data = await reportService.getDashboard()
    res.json(data)
  }catch(err){
    next(err)
  }
}

exports.getSalesReport = async (req,res,next)=>{
  try{
    const data = await reportService.getSalesReport(
      req.query.from,
      req.query.to
    )
    res.json(data)
  }catch(err){
    next(err)
  }
}

exports.getTopProducts = async (req,res,next)=>{
  try{
    const data = await reportService.getTopProducts()
    res.json(data)
  }catch(err){
    next(err)
  }
}

exports.getInventoryValue = async (req,res,next)=>{
  try{
    const data = await reportService.getInventoryValue()
    res.json(data)
  }catch(err){
    next(err)
  }
}

exports.getReceivables = async (req,res,next)=>{
  try{
    const data = await reportService.getReceivables()
    res.json(data)
  }catch(err){
    next(err)
  }
}
exports.exportSalesReport = async (req,res,next)=>{
  try{
    const {from,to} = req.query
    const data = await reportService.getSalesReport(from,to)

    const { Parser } = require('json2csv')

    const parser = new Parser()
    const csv = parser.parse(data)

    res.header('Content-Type','text/csv')
    res.attachment('sales-report.csv')
    return res.send(csv)

  }catch(err){
    next(err)
  }
}