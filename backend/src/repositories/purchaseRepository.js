exports.insertPurchaseInvoice = async (client,data,userId)=>{
  const result = await client.query(`
    INSERT INTO invoices
    (
      invoice_number,
      type,
      party_id,
      subtotal,
      discount,
      tax,
      grand_total,
      created_by
    )
    VALUES
    (
      generate_invoice_number('purchase'),
      'purchase',
      $1,$2,$3,$4,$5,$6
    )
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

exports.insertPurchaseItem = async (client,invoiceId,item)=>{
  await client.query(`
    INSERT INTO invoice_items
    (
      invoice_id,
      product_unit_id,
      quantity,
      rate,
      total
    )
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
  await client.query(`
    INSERT INTO payments
    (
      invoice_id,
      payment_method,
      amount
    )
    VALUES ($1,$2,$3)
  `,
  [
    invoiceId,
    payment.method,
    payment.amount
  ])
}