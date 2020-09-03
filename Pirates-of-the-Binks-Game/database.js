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

  db.progress.findOne({username:username},function(err,res){
    if(res.items != null){
      cb({items:res.items})
    } else {
      cb({items:[]})
    }
  })
}

Database.savePlayerProgress = function(data,cb){
  db.progress.update({username:data.username},{$set:{items:data.items}},{upsert:true},cb)
}
