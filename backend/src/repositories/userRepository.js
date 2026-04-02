const db = require('../config/db')

exports.findByUsername = async(username)=>{

  const result = await db.query(
    `SELECT * FROM users WHERE username=$1 AND active=true`,
    [username]
  )
  return result.rows[0]

}