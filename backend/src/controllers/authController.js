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
exports.me = async (req, res, next) => {
  try {
    res.json({ id: req.user.id, role: req.user.role })
  } catch (err) { next(err) }
}

exports.changePassword = async (req,res,next)=>{
  try{
    const {current,newPassword} = req.body
    const result = await authService.changePassword(
      req.user.id,
      current,
      newPassword
    )
    res.json(result)
  }catch(err){ next(err) }
}