const db = require('../config/db')

exports.getAll = async () => {
  const result = await db.query(
    `
    SELECT
      p.id,
      p.name,
      p.phone,
      p.type,
      p.credit_limit,
      COALESCE(
        SUM(CASE WHEN le.entry_type = 'debit'  THEN le.amount ELSE 0 END) -
        SUM(CASE WHEN le.entry_type = 'credit' THEN le.amount ELSE 0 END),
        0
      ) AS outstanding
    FROM parties p
    LEFT JOIN ledger_entries le ON le.party_id = p.id
    GROUP BY p.id, p.name, p.phone, p.type, p.credit_limit
    ORDER BY p.name
    `
  )
  return result.rows
}

exports.getById = async (id) => {
  const result = await db.query(
    `
    SELECT *
    FROM parties
    WHERE id=$1
    `,
    [id]
  )
  return result.rows[0]
}

exports.insertParty = async (data) => {
  const result = await db.query(
    `
    INSERT INTO parties
    (
      name,
      phone,
      type,
      credit_limit
    )
    VALUES ($1,$2,$3,$4)
    RETURNING *
    `,
    [
      data.name,
      data.phone,
      data.type,
      data.credit_limit || 0
    ]
  )
  return result.rows[0]
}

exports.updateParty = async (id, data) => {
  const result = await db.query(
    `
    UPDATE parties
    SET
      name=$1,
      phone=$2,
      type=$3,
      credit_limit=$4
    WHERE id=$5
    RETURNING *
    `,
    [
      data.name,
      data.phone,
      data.type,
      data.credit_limit,
      id
    ]
  )
  return result.rows[0]
}

exports.getLedger = async (partyId) => {
  const result = await db.query(
    `
    SELECT
      le.entry_type AS type,
      COALESCE(i.invoice_number, le.description, '') AS reference,
      le.amount,
      TO_CHAR(le.created_at, 'YYYY-MM-DD') AS date
    FROM ledger_entries le
    LEFT JOIN invoices i ON i.id = le.invoice_id
    WHERE le.party_id=$1
    ORDER BY le.created_at DESC
    `,
    [partyId]
  )
  return result.rows
}