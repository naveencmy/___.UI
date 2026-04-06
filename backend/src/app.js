const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const salesRoutes = require('./routes/salesRoutes')
const purchaseRoutes = require('./routes/purchaseRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes')
const partyRoutes = require('./routes/partyRoutes')
const reportRoutes = require('./routes/reportRoutes')
const userRoutes = require('./routes/userRoutes')
const backupRoutes = require('./routes/backupRoutes')

const errorMiddleware = require('./middleware/errorMiddleware')
const { PORT } = require('./config/env')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use('/sales', salesRoutes)
app.use('/purchase', purchaseRoutes)
app.use('/inventory', inventoryRoutes)
app.use('/parties', partyRoutes)
app.use('/reports', reportRoutes)
app.use('/users', userRoutes)
app.use('/backup', backupRoutes)

app.use(errorMiddleware)
app.get('/', (req,res)=>{
  res.json({
    service: "POS Backend",
    status: `running on ${PORT}`
  })
})
module.exports = app