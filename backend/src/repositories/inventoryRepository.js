const db = require('../config/db')

exports.getInventory = async () => {
  const result = await db.query(`
    SELECT
      i.product_unit_id,
      p.name,
      pu.unit_name,
      i.quantity,
      pu.purchase_rate,
      (i.quantity * pu.purchase_rate) AS stock_value
    FROM inventory i
    JOIN product_units pu
      ON pu.id = i.product_unit_id
    JOIN products p
      ON p.id = pu.product_id
    ORDER BY p.name
  `)

  return result.rows
}

exports.getStockMovements = async () => {
  const result = await db.query(`
    SELECT
      sm.id,
      p.name,
      pu.unit_name,
      sm.quantity,
      sm.movement_type,
      sm.created_at
    FROM stock_movements sm
    JOIN product_units pu
      ON pu.id = sm.product_unit_id
    JOIN products p
      ON p.id = pu.product_id
    ORDER BY sm.created_at DESC
    LIMIT 200
  `)
  return result.rows
}

exports.getLowStock = async () => {
  const result = await db.query(`
    SELECT
      p.name,
      pu.unit_name,
      i.quantity,
      p.reorder_level
    FROM inventory i
    JOIN product_units pu
      ON pu.id=i.product_unit_id
    JOIN products p
      ON p.id=pu.product_id
    WHERE i.quantity <= p.reorder_level
    ORDER BY i.quantity ASC
  `)
  return result.rows
}

exports.insertAdjustment = async (client,data,userId)=>{
  const result = await client.query(`
    INSERT INTO inventory_adjustments
    (
      product_unit_id,
      quantity_change,
      reason,
      created_by
    )
    VALUES ($1,$2,$3,$4)
    RETURNING *
  `,
  [
    data.product_unit_id,
    data.quantity_change,
    data.reason,
    userId
  ])
  return result.rows[0]
}

exports.updateInventory = async (client,productUnitId,qty)=>{
  await client.query(`
    INSERT INTO inventory(product_unit_id,quantity)
    VALUES ($1,$2)
    ON CONFLICT(product_unit_id)
    DO UPDATE
    SET quantity = inventory.quantity + $2
  `,
  [productUnitId,qty])
}

exports.insertStockMovement = async (
  client,
  productUnitId,
  qty,
  type,
  reference
)=>{
  await client.query(`
    INSERT INTO stock_movements
    (product_unit_id,quantity,movement_type,reference_id)
    VALUES ($1,$2,$3,$4)
  `,
  [productUnitId,qty,type,reference])
}