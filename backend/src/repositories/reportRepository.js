const db = require('../config/db')

/*
Today's total sales
Used in dashboard
*/
exports.getTodaySales = async () => {
  const result = await db.query(
  `
  SELECT
  COALESCE(SUM(grand_total),0) AS total_sales
  FROM invoices
  WHERE type='sale'
  AND created_at::date = CURRENT_DATE
  `
  )
  return result.rows[0]
}

/*
Number of transactions today
*/
exports.getTodayTransactions = async () => {
  const result = await db.query(
  `
  SELECT
  COUNT(*) AS transactions
  FROM invoices
  WHERE type='sale'
  AND created_at::date = CURRENT_DATE
  `
  )
  return result.rows[0]
}

/*
Top selling products
*/
exports.getTopProducts = async () => {
  const result = await db.query(
  `
  SELECT
  p.name,
  SUM(ii.quantity) AS total_sold
  FROM invoice_items ii
  JOIN product_units pu
    ON pu.id = ii.product_unit_id
  JOIN products p
    ON p.id = pu.product_id
  JOIN invoices i
    ON i.id = ii.invoice_id
  WHERE i.type='sale'
  GROUP BY p.name
  ORDER BY total_sold DESC
  LIMIT 10
  `
  )
  return result.rows
}

/*
Total inventory value
*/
exports.getInventoryValue = async () => {
  const result = await db.query(
  `
  SELECT
  COALESCE(SUM(i.quantity * pu.purchase_rate),0) AS stock_value
  FROM inventory i
  JOIN product_units pu
    ON pu.id=i.product_unit_id
  `
  )
  return result.rows[0]
}

/*
Low stock alerts
*/
exports.getLowStock = async () => {
  const result = await db.query(
  `
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
  WHERE i.quantity < p.reorder_level
  ORDER BY i.quantity ASC
  `
  )
  return result.rows
}

/*
Receivable summary
Customers with outstanding balance
*/
exports.getReceivableSummary = async () => {
  const result = await db.query(
  `
  SELECT
  p.name,
  SUM(
    CASE WHEN le.entry_type='debit'
    THEN le.amount ELSE 0 END
  ) -
  SUM(
    CASE WHEN le.entry_type='credit'
    THEN le.amount ELSE 0 END
  ) AS balance
  FROM ledger_entries le
  JOIN parties p
    ON p.id = le.party_id
  GROUP BY p.name
  HAVING
  SUM(
    CASE WHEN le.entry_type='debit'
    THEN le.amount ELSE 0 END
  ) -
  SUM(
    CASE WHEN le.entry_type='credit'
    THEN le.amount ELSE 0 END
  ) > 0
  ORDER BY balance DESC
  `
  )
  return result.rows
}

/*
Sales report by date range
*/
exports.getSalesReport = async (from,to) => {
  const result = await db.query(
  `
  SELECT
    i.invoice_number,
    i.created_at,
    p.name AS customer,
    i.grand_total
  FROM invoices i
  LEFT JOIN parties p
  ON p.id=i.party_id
  WHERE i.type='sale'
  AND i.created_at BETWEEN $1 AND $2
  ORDER BY i.created_at DESC
  `,
  [from,to]
  )
  return result.rows
}