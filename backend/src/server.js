const app = require('./app')
const env = require('./config/env')
const logger= require('./utils/logger')
logger.info(`POS Backend running on port ${env.PORT}`)
app.listen(env.PORT, () => {
  console.log(`POS Backend running on port ${env.PORT}`)
})
