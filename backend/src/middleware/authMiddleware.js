const jwt = require('jsonwebtoken')
const env = require('../config/env')

module.exports = (req,res,next)=>{
  const header = req.headers.authorization
  if(!header) return res.status(401).json({message:"Unauthorized"})
  const token = header.split(" ")[1]
  try{
    const decoded = jwt.verify(token,env.JWT_SECRET)
    req.user = decoded
    next()
  }catch(err){
    res.status(401).json({message:"Invalid Token"})
  }

}