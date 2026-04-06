const db = require('../config/db')

exports.findByUsername = async(username)=>{

  const result = await db.query(
    `SELECT * FROM users WHERE username=$1 AND active=true`,
    [username]
  )
  return result.rows[0]

}
exports.getAll = async ()=>{
  const result = await db.query(`SELECT id,username,role,active FROM users`)
  return result.rows
}

exports.insert = async (data)=>{
  const result = await db.query(`
    INSERT INTO users(username,password_hash,role)
    VALUES ($1,$2,$3)
    RETURNING id,username,role
  `,[data.username,data.password_hash,data.role])
  return result.rows[0]
}

exports.toggleActive = async (id)=>{
  await db.query(`
    UPDATE users SET active = NOT active WHERE id=$1
  `,[id])
}

exports.findById = async (id) => {
  const result = await db.query(`SELECT * FROM users WHERE id=$1`, [id])
  return result.rows[0]
}

exports.updatePassword = async (id, hash) => {
  await db.query(`UPDATE users SET password_hash=$1 WHERE id=$2`, [hash, id])
}

exports.update = async (id, data) => {
  const { role } = data
  const result = await db.query(
    `UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, role, active`,
    [role, id]
  )
  return result.rows[0]
}