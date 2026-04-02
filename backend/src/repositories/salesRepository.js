const db = require('../config/db')

exports.insertInvoice = async (client,data,userId)=>{
  const result = await client.query(
  `
  INSERT INTO invoices
  (invoice_number,type,party_id,subtotal,discount,tax,grand_total,created_by)
  VALUES
  (generate_invoice_number('sale'),
    'sale',$1,$2,$3,$4,$5,$6)
  RETURNING id,invoice_number
  `,
  [
    data.party_id,
    data.subtotal,
    data.discount,
    data.tax,
    data.total,
    userId
  ])
  return result.rows[0]
}

exports.insertInvoiceItem = async (client,invoiceId,item)=>{
  await client.query(
  `
  INSERT INTO invoice_items
  (invoice_id,product_unit_id,quantity,rate,total)
  VALUES ($1,$2,$3,$4,$5)
  `,
  [
    invoiceId,
    item.product_unit_id,
    item.quantity,
    item.rate,
    item.total
  ])
}

exports.insertPayment = async (client,invoiceId,payment)=>{
  await client.query(
  `
  INSERT INTO payments
  (invoice_id,payment_method,amount)
  VALUES ($1,$2,$3)
  `,
  [
    invoiceId,
    payment.method,
    payment.amount
  ])
}

exports.getStockForUpdate = async (client,productUnitId)=>{
  const result = await client.query(
  `
  SELECT quantity FROM inventory
  WHERE product_unit_id=$1
  FOR UPDATE
  `,
  [productUnitId]
  )
  return result.rows[0]
}

exports.reduceInventory = async (client,productUnitId,qty)=>{
  await client.query(
  `
  UPDATE inventory
  SET quantity = quantity - $1
  WHERE product_unit_id=$2
  `,
  [qty,productUnitId]
  )
}

exports.insertStockMovement = async (client,productUnitId,qty,type,ref)=>{
  await client.query(
  `
  INSERT INTO stock_movements
  (product_unit_id,quantity,movement_type,reference_id)
  VALUES ($1,$2,$3,$4)
  `,
  [productUnitId,qty,type,ref]
  )
}