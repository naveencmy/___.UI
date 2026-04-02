const { Pool } = require('pg')
const env = require('./env')

const pool = new Pool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  port: env.DB_PORT,
  max: 20,
  idleTimeoutMillis: 30000
})
pool.on('error', (err) => {
  console.error('Unexpected DB error', err)
})
module.exports = pool