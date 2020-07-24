//remove

socket.on('remove',function(data){
  for(let i = 0 ; i < data.player.length ; i++){
    delete Player.list[data.player[i]]
  }
  for(let i = 0 ; i < data.bullet.length ; i++){
    delete Bullet.list[data.bullet[i]]
  }
})
