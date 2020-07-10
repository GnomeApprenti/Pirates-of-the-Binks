
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

let SOCKET_LIST = {}

//////////////////////////////////////////
//interactions on connection
//////////////////////////////////////////

//defining socket's parameters and adding it to the socket list
let io = require('socket.io')(serv, {})
io.sockets.on('connection', function(socket){

  socket.id = Math.random()
  socket.x = 0
  socket.y = 0
  socket.number = "" + Math.floor(10 * Math.random())
  SOCKET_LIST[socket.id] = socket

  console.log("socket connection. id : " + socket.id)

  socket.on('disconnect',function(){
    delete SOCKET_LIST[socket.id]
  })

})

//updating socket's parameters and sending them to client
setInterval(function(){

  let pack = []

  for(let i in SOCKET_LIST){
    let socket = SOCKET_LIST[i]
    socket.x++
    socket.y++

    pack.push({
      x:socket.x,
      y:socket.y,
      number:socket.number
    })
  }

  for(let i in SOCKET_LIST){
    let socket = SOCKET_LIST[i]
    socket.emit('newPositions',pack)
  }

},1000/25)
