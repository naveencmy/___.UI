const productRepo = require('../repositories/productRepository')

exports.getProducts = async ()=>{
  return productRepo.getAll()
}

exports.searchProducts = async (term)=>{
  return productRepo.search(term)
}

exports.getProductByBarcode = async (barcode)=>{
  return productRepo.getByBarcode(barcode)
}



exports.createProduct = async (data)=>{
  const product = await productRepo.insertProduct(data)
  for(const unit of data.units){
    await productRepo.insertUnit(product.id,unit)
  }
  return product
}



exports.updateProduct = async (id,data)=>{
  await productRepo.updateProduct(id,data)
  return {message:"Product updated"}
}

exports.deleteProduct = async (id)=>{
  return productRepo.deleteProduct(id)
}