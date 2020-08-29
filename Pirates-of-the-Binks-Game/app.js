//////////////////////////////////////////
//initializing server
//////////////////////////////////////////

require('./entity.js')
require('./client/js/inventory.js')
require('./database.js')

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
//interactions on connection
//////////////////////////////////////////

const DEBUG = true

let USERS = {
  "bob":"asd",

}



let io = require('socket.io')(serv, {})
io.sockets.on('connection', function(socket){
  console.log("socket connection. id : " + socket.id)

  socket.id = Math.random()
  SOCKET_LIST[socket.id] = socket

  socket.on('signIn',function(data){
    Database.isValidPassword(data,function(res){
      if(res){
        Database.getPlayerProgress(data.username,function(progress){
          Player.onConnect(socket,data.username,progress)
          socket.emit('signInResponse',{success:true})
        })
      } else {
        socket.emit('signInResponse',{success:false})// debug mode = true
      }
    })
  })

  socket.on('signUp',function(data){
    Database.isUsernameTaken(data,function(res){
      if(res){
        socket.emit('signUpResponse',{success:false})
      }else{
        Database.addUser(data,function(){
          console.log('added user     ' + data);
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

//update
setInterval(function(){

  let packs = Entity.getFrameUpdateData()

  for(let i in SOCKET_LIST){
    let socket = SOCKET_LIST[i]
    socket.emit('update',packs.updatePack)
    socket.emit('init',packs.initPack)
    socket.emit('remove',packs.removePack)
  }

},1000/25)
