const { exec } = require('child_process')

exports.backup = async (req,res,next)=>{
  exec('pg_dump your_db > backup.sql',(err)=>{
    if(err) return next(err)
    res.json({message:"Backup created"})
  })
}

exports.restore = async (req,res,next)=>{
  exec('psql your_db < backup.sql',(err)=>{
    if(err) return next(err)
    res.json({message:"Restored"})
  })
}