//update

socket.on('update',function(data){
  for(let i = 0 ; i < data.player.length ; i++){
    let pack = data.player[i]
    let p = Player.list[pack.id]
    if(p){

      if(pack.x !== undefined)
        p.x = pack.x
      if(pack.y !== undefined)
        p.y = pack.y

      if(pack.hp !== undefined)
        p.hp = pack.hp

      if(pack.score !== undefined)
        p.score = pack.score

      if(pack.map !== undefined)
        p.map = pack.map
    }
  }

  for(let i = 0 ; i < data.bullet.length ; i++){
    let pack = data.bullet[i]
    let p = Bullet.list[pack.id]
    if(p){
      if(pack.x !== undefined)
        p.x = pack.x
      if(pack.y !== undefined)
        p.y = pack.y
    }
  }
})
