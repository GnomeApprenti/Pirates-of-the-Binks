//////////////////////////////////////////
//initializing server
//////////////////////////////////////////

let mongojs = require("mongojs")
let db = mongojs('localhost:27017/PiratesOfTheBinks', ['account','progress'])

let express = require('express')
let app = express()
let serv = require('http').Server(app)


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html')
})

app.use('/client', express.static(__dirname + '/client'))

serv.listen(2000)
console.log("server started")

//////////////////////////////////////////
//player and entity class
//////////////////////////////////////////

let SOCKET_LIST = {}

let Entity = function(param){

  let self = {

    x:250,
    y:250,
    spdX:0,
    spdY:0,
    id:"",
    map:'sea',

  }
  if(param){
    if(param.x)
      self.x = param.x
    if(param.y)
      self.y = param.y
    if(param.map)
      self.map = param.map
    if(param.id)
      self.id = param.id
  }

  self.update = function(){
    self.updatePosition()
  }

  self.updatePosition = function(){
    self.x += self.spdX
    self.y += self.spdY
  }

  self.getDistance = function(pt){
    return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2))
  }

  return self

}

let Player = function(param){

  let self = Entity(param)
  self.number = "" + Math.floor(10 * Math.random())
  self.pressingRight = false
  self.pressingLeft = false
  self.pressingUp = false
  self.pressingDown = false
  self.pressingAttack = false
  self.mouseAngle = 0
  self.maxSpd = 10
  self.hp = 10
  self.hpMax = 10
  self.score = 0
  self.username = param.username

  let super_update = self.update
  self.update = function(){
    self.updateSpd()
    super_update()


    if(self.pressingAttack){
      self.shootBullet(self.mouseAngle)
    }


  }

  self.shootBullet = function(angle){
    var b = Bullet({
      parent:self.id,
      angle:angle,
      x:self.x,
      y:self.y,
      map:self.map,
    })

    if(self.spdX >= 0){
      b.spdX += self.spdX
      b.spdY += self.spdY
    }
  }

  self.updateSpd = function(){
    if(self.pressingRight)
      self.spdX = self.maxSpd
    else if(self.pressingLeft)
      self.spdX = -self.maxSpd
    else
      self.spdX = 0

    if(self.pressingUp)
      self.spdY = -self.maxSpd
    else if(self.pressingDown)
      self.spdY = self.maxSpd
    else
      self.spdY = 0
  }

  self.getInitPack = function(){
    return{
      id:self.id,
      x:self.x,
      y:self.y,
      number:self.number,
      hp:self.hp,
      hpMax:self.hpMax,
      score:self.score,
      map:self.map,
    }
  }

  self.getUpdatePack = function(){
    return {
      id:self.id,
      x:self.x,
      y:self.y,
      number:self.number,
      hp:self.hp,
      score:self.score,
      map:self.map,
    }
  }

  Player.list[self.id] = self

  initPack.player.push(self.getInitPack())

  return self

}
Player.list = {}
Player.onConnect = function(socket,username){
  let map = 'sea'
  if(Math.random() < 0.5)
    map = 'coast'
  let player = Player({
    username:username,
    id:socket.id,
    map:map,
  })

  socket.on('keyPress', function(data){
    if (data.inputId === 'left')
      player.pressingLeft = data.state
    else if (data.inputId === 'right')
      player.pressingRight = data.state
    else if (data.inputId === 'up')
      player.pressingUp = data.state
    else if (data.inputId === 'down')
      player.pressingDown = data.state
    else if (data.inputId === 'attack')
      player.pressingAttack= data.state
    else if (data.inputId === 'mouseAngle')
      player.mouseAngle = data.state
  })

  socket.on('changeMap',function(data){
    if(player.map === 'sea')
      player.map = 'coast'
    else {
      player.map = 'sea'
    }
  })

  socket.on('sendMsgToServer',function(data){
    for(var i in SOCKET_LIST){
      SOCKET_LIST[i].emit('addToChat',player.username + ': ' + data)
    }
  })

  socket.on('sendPmToServer',function(data){
    let recipientSocket = null
    for(let i in Player.list)
      if(Player.list[i].username === data.username)
        recipientSocket = SOCKET_LIST[i]
    if(recipientSocket === null){
      socket.emit('addToChat', 'The player ' + data.username + ' is not online.')
    } else {
      recipientSocket.emit('addToChat','From ' + player.username + ': ' + data.message)
      socket.emit('addToChat','To ' + data.username + ': ' + data.message)
    }
  })

  socket.emit('init',{
    selfId:socket.id,
    player:Player.getAllInitPack(),
    bullet:Bullet.getAllInitPack(),
  })
}

Player.getAllInitPack = function(){
  let players = []
  for(let i in Player.list)
    players.push(Player.list[i].getInitPack())
  return players
}

Player.onDisconnect = function(socket){
  delete Player.list[socket.id]
  removePack.player.push(socket.id)
}

Player.update = function(){
  let pack = []

  for(let i in Player.list){
    let player = Player.list[i]

    player.update()

    pack.push(player.getUpdatePack())
  }
  return pack;
}

let Bullet = function(param){

  let self = Entity(param)
  self.id = Math.random()
  self.angle = param.angle
  self.spdX = Math.cos(param.angle/180*Math.PI)*10
  self.spdY = Math.sin(param.angle/180*Math.PI)*10
  self.parent = param.parent
  self.timer = 0
  self.toRemove = false

  let super_update = self.update
  self.update = function(){
    if(self.timer++ > 100)
      self.toRemove = true
    super_update()

    for(let i in Player.list){
      let p = Player.list[i]
      if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id){

        p.hp -=1

        if(p.hp <= 0) {

          let shooter = Player.list[self.parent]

          if(shooter)
            shooter.score += 1

          p.hp = p.hpMax
          p.x = Math.random() * 500
          p.y = Math.random() * 500
        }

        self.toRemove = true
      }
    }
  }

  self.getInitPack = function(){
    return{
      id:self.id,
      x:self.x,
      y:self.y,
      map:self.map,
    }
  }

  self.getUpdatePack = function(){
    return {
      id:self.id,
      x:self.x,
      y:self.y,
    }
  }

  Bullet.list[self.id] = self
  initPack.bullet.push(self.getInitPack())
  return self
}

Bullet.list = {}

Bullet.update = function(){

  let pack = []

  for(let i in Bullet.list){
    let bullet = Bullet.list[i]

    bullet.update()

    if(bullet.toRemove){
      delete Bullet.list[i]
      removePack.bullet.push(bullet.id)
    } else {
      pack.push(bullet.getUpdatePack())
    }
  }
  return pack;
}

Bullet.getAllInitPack = function(){
  let bullets = []
  for(let i in Bullet.list)
    bullets.push(Bullet.list[i].getInitPack())
  return bullets
}

//////////////////////////////////////////
//interactions on connection
//////////////////////////////////////////

const DEBUG = true

let USERS = {
  "bob":"asd",

}

let isValidPassword = function(data,cb){
  db.account.find({username:data.username,password:data.password},function(err,res){
    if(res.length > 0){
      cb(true)
    } else {
      cb(false)
    }
  })
}

let isUsernameTaken = function(data,cb){
  db.account.find({username:data.username},function(err,res){
    if(res.length > 0){
      cb(true)
    } else {
      cb(false)
    }
  })
}

let addUser = function(data,cb){
  db.account.insert({username:data.username,password:data.password},function(err){
    cb()
  })
}

let io = require('socket.io')(serv, {})
io.sockets.on('connection', function(socket){
  console.log("socket connection. id : " + socket.id)

  socket.id = Math.random()
  SOCKET_LIST[socket.id] = socket

  socket.on('signIn',function(data){
    isValidPassword(data,function(res){
      if(res){
        Player.onConnect(socket,data.username)
        socket.emit('signInResponse',{success:true})
      } else {
        socket.emit('signInResponse',{success:false})
      }
    })
  })

  socket.on('signUp',function(data){
    isUsernameTaken(data,function(res){
      if(res){
        socket.emit('signUpResponse',{success:false})
      }else{
        addUser(data,function(){
          socket.emit('signUpResponse',{success:true})
        })
      }
    })
  })


  socket.on('disconnect',function(){
    delete SOCKET_LIST[socket.id]
    Player.onDisconnect(socket)
  })

  socket.on('evalServer',function(data){
    if(!DEBUG)
      return
    else{
      let result = eval(data)
      socket.emit('evalAnswer',result)
    }

  })

})

let initPack = {player:[],bullet:[]}
let removePack = {player:[],bullet:[]}

//update
setInterval(function(){
  let pack = {
    player:Player.update(),
    bullet:Bullet.update(),
  }

  for(let i in SOCKET_LIST){
    let socket = SOCKET_LIST[i]
    socket.emit('update',pack)
    socket.emit('init',initPack)
    socket.emit('remove',removePack)
  }
  initPack.player = []
  initPack.bullet = []
  removePack.player = []
  removePack.bullet = []

},1000/25)
