let mongojs = require("mongojs")
let db = mongojs('localhost:27017/PiratesOfTheBinks', ['account','progress'])

Database = {}

Database.isValidPassword = function(data,cb){
  db.account.find({username:data.username,password:data.password},function(err,res){
    if(res.length > 0){
      cb(true)
    } else {
      cb(false)
    }
  })
}

Database.isUsernameTaken = function(data,cb){
  db.account.find({username:data.username},function(err,res){
    if(res.length > 0){
      cb(true)
    } else {
      cb(false)
    }
  })
}

Database.addUser = function(data,cb){
  db.account.insert({username:data.username,password:data.password},function(err){
    Database.savePlayerProgress({username:data.username,items:[]},function(){
      cb()
    })
  })
}

Database.getPlayerProgress = function(username,cb){
  return cb({items:[]})

  db.progress.insert({username:data.username},function(err,res){
    cb({items:res.items})
  })
}

Database.savePlayerProgress = function(data,cb){
  cb = cb || function(){}

  db.progress.update({username:data.username},data,{upsert:true},cb)
}
