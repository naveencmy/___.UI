const db = require('../config/db')


exports.getAll = async ()=>{
  const result = await db.query(
  `
  SELECT
    p.id,
    p.name,
    pu.id as unit_id,
    pu.unit_name,
    pu.barcode,
    pu.sales_rate,
    pu.purchase_rate
  FROM products p
  JOIN product_units pu
  ON pu.product_id=p.id
  ORDER BY p.name
  `
  )
  return result.rows
}

exports.search = async (term)=>{
  const result = await db.query(
  `
  SELECT
    p.id,
    p.name,
    pu.id as unit_id,
    pu.barcode,
    pu.sales_rate,
    pu.unit_name
  FROM products p
  JOIN product_units pu
  ON pu.product_id=p.id
  WHERE p.name ILIKE $1
  OR pu.barcode=$2
  LIMIT 20
  `,
  [`%${term}%`,term])
  return result.rows
}

exports.getByBarcode = async (barcode)=>{
  const result = await db.query(
  `
  SELECT
    p.id,
    p.name,
    pu.id as unit_id,
    pu.unit_name,
    pu.sales_rate,
    pu.barcode
  FROM product_units pu
  JOIN products p
  ON p.id=pu.product_id
  WHERE pu.barcode=$1
  `,
  [barcode])
  return result.rows[0]
}

exports.insertProduct = async (data)=>{
  const result = await db.query(
  `
  INSERT INTO products
  (
    name,
    sku,
    category,
    reorder_level
  )
  VALUES ($1,$2,$3,$4)
  RETURNING *
  `,
  [
    data.name,
    data.sku,
    data.category,
    data.reorder_level || 0
  ])
  return result.rows[0]
}
exports.insertUnit = async (productId,unit)=>{
  await db.query(
  `
  INSERT INTO product_units
  (
    product_id,
    unit_name,
    conversion_factor,
    barcode,
    purchase_rate,
    sales_rate
  )
  VALUES ($1,$2,$3,$4,$5,$6)
  `,
  [
    productId,
    unit.unit_name,
    unit.conversion_factor,
    unit.barcode,
    unit.purchase_rate,
    unit.sales_rate
  ])
}

exports.updateProduct = async (id,data)=>{
  await db.query(
  `
  UPDATE products
  SET
    name=$1,
    sku=$2,
    category=$3,
    reorder_level=$4
  WHERE id=$5
  `,
  [
    data.name,
    data.sku,
    data.category,
    data.reorder_level,
    id
  ])

}

exports.deleteProduct = async (id)=>{
  await db.query(
  `DELETE FROM products WHERE id=$1`,
  [id]
  )

}