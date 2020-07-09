let express = require('express')
let app = express()
let serv = require('http').Server(app)

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html')
})

app.use('/client', express.static(__dirname + '/client'))

serv.listen(2000)
console.log("server started")

let io = require('socket.io')(serv, {})
io.sockets.on('connection', function(socket){

  console.log("socket connection")

  socket.on('binks',function(data){
    console.log("binks " + data.reason)
  })

  socket.emit('serverMsg',{
    msg:"ça va frère le boss tu es en mode lacoste tn et tout?",
  })

})
