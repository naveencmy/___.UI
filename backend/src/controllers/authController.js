const authService = require('../services/authService')

exports.login = async(req,res,next)=>{
  try{
    const {username,password} = req.body
    const data = await authService.login(username,password)
    res.json(data)
  }catch(err){
    next(err)
  }

}