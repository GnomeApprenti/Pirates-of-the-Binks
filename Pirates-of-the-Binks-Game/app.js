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

let Entity = function(){

  let self = {

    x:250,
    y:250,
    spdX:0,
    spdY:0,
    id:"",

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

let Player = function(id){

  let self = Entity()
  self.id = id
  self.number = "" + Math.floor(10 * Math.random())
  self.pressingRight = false
  self.pressingLeft = false
  self.pressingUp = false
  self.pressingDown = false
  self.pressingAttack = false
  self.mouseAngle = 0
  self.maxSpd = 10

  let super_update = self.update
  self.update = function(){
    self.updateSpd()
    super_update()


    if(self.pressingAttack){
      self.shootBullet(self.mouseAngle)
    }


  }

  self.shootBullet = function(angle){
    var b = Bullet(self.id,angle)
    b.x = self.x
    b.y = self.y
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
  Player.list[id] = self
  return self

}
Player.list = {}
Player.onConnect = function(socket){

  let player = Player(socket.id)

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
}

Player.onDisconnect = function(socket){
  delete Player.list[socket.id]
}

Player.update = function(){
  let pack = []

  for(let i in Player.list){
    let player = Player.list[i]

    player.update()

    pack.push({
      x:player.x,
      y:player.y,
      number:player.number
    })
  }
  return pack;
}

let Bullet = function(parent, angle){

  let self = Entity()
  self.id = Math.random()
  self.spdX = Math.cos(angle/180*Math.PI)*10
  self.spdY = Math.sin(angle/180*Math.PI)*10
  self.parent = parent
  self.timer = 0
  self.toRemove = false

  let super_update = self.update
  self.update = function(){
    if(self.timer++ > 100)
      self.toRemove = true
    super_update()

    for(let i in Player.list){
      let p = Player.list[i]
      if(self.getDistance(p) < 32 && self.parent !== p.id){
        console.log("collision");
        self.toRemove = true
      }
    }
  }
  Bullet.list[self.id] = self
  return self
}

Bullet.list = {}

Bullet.update = function(){

  let pack = []

  for(let i in Bullet.list){
    let bullet = Bullet.list[i]

    bullet.update()

    if(bullet.toRemove)
      delete Bullet.list[i]

    pack.push({
      x:bullet.x,
      y:bullet.y,
    })
  }
  return pack;
}
//////////////////////////////////////////
//interactions on connection
//////////////////////////////////////////

//defining socket's parameters and adding it to the socket list

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
        Player.onConnect(socket)
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

  socket.on('sendMsgToServer',function(data){
    let playerName = ("" + socket.id).slice(2,7)
    for(var i in SOCKET_LIST){
      SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data)
    }
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

//updating socket's parameters and sending them to client
setInterval(function(){
  let pack = {
    player:Player.update(),
    bullet:Bullet.update(),
  }

  for(let i in SOCKET_LIST){
    let socket = SOCKET_LIST[i]
    socket.emit('newPositions',pack)
  }

},1000/25)
