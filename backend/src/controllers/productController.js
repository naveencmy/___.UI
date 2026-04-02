const productService = require('../services/productService')
exports.getProducts = async (req,res,next)=>{
  try{
    const products = await productService.getProducts()
    res.json(products)
  }catch(err){
    next(err)
  }

}

exports.searchProducts = async (req,res,next)=>{
  try{
    const products = await productService.searchProducts(req.query.q)
    res.json(products)
  }catch(err){
    next(err)
  }
}

exports.getProductByBarcode = async (req,res,next)=>{
  try{
    const product = await productService.getProductByBarcode(req.params.code)
    res.json(product)
  }catch(err){
    next(err)
  }
}

exports.createProduct = async (req,res,next)=>{
  try{
    const product = await productService.createProduct(req.body)
    res.json(product)
  }catch(err){
    next(err)
  }
}

exports.updateProduct = async (req,res,next)=>{
  try{
    const product = await productService.updateProduct(req.params.id,req.body)
    res.json(product)
  }catch(err){
    next(err)
  }
}

exports.deleteProduct = async (req,res,next)=>{
  try{
    await productService.deleteProduct(req.params.id)
    res.json({message:"Product deleted"})
  }catch(err){
    next(err)
  }
}