const userRepo = require('../repositories/userRepository')
const bcrypt = require('bcrypt')

exports.getUsers = () => userRepo.getAll()

exports.createUser = async (data)=>{
  const hash = await bcrypt.hash(data.password,10)
  return userRepo.insert({...data, password_hash: hash})
}

exports.updateUser = (id,data)=> userRepo.update(id,data)

exports.toggleUser = (id)=> userRepo.toggleActive(id)