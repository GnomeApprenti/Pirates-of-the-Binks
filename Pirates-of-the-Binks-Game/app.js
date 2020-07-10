
//////////////////////////////////////////
//initializing server
//////////////////////////////////////////

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
  self.maxSpd = 10

  let super_update = self.update
  self.update = function(){
    self.updateSpd()
    super_update()
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

//////////////////////////////////////////
//interactions on connection
//////////////////////////////////////////

//defining socket's parameters and adding it to the socket list
let io = require('socket.io')(serv, {})
io.sockets.on('connection', function(socket){

  socket.id = Math.random()
  SOCKET_LIST[socket.id] = socket

  Player.onConnect(socket)

  console.log("socket connection. id : " + socket.id)

  socket.on('disconnect',function(){
    delete SOCKET_LIST[socket.id]
    Player.onDisconnect(socket)
  })

})

//updating socket's parameters and sending them to client
setInterval(function(){
  let pack = Player.update();

  for(let i in SOCKET_LIST){
    let socket = SOCKET_LIST[i]
    socket.emit('newPositions',pack)
  }

},1000/25)
