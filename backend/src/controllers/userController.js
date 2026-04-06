const userService = require('../services/userService')

exports.getUsers = async (req,res,next)=>{
  try{
    const users = await userService.getUsers()
    res.json(users)
  }catch(err){ next(err) }
}

exports.createUser = async (req,res,next)=>{
  try{
    const user = await userService.createUser(req.body)
    res.json(user)
  }catch(err){ next(err) }
}

exports.updateUser = async (req,res,next)=>{
  try{
    const user = await userService.updateUser(req.params.id, req.body)
    res.json(user)
  }catch(err){ next(err) }
}

exports.toggleUser = async (req,res,next)=>{
  try{
    const user = await userService.toggleUser(req.params.id)
    res.json(user)
  }catch(err){ next(err) }
}