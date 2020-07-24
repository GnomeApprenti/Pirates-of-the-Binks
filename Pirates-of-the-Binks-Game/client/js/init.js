//init

let Player = function(initPack){
  let self = {}
  self.id = initPack.id
  self.number = initPack.number
  self.x = initPack.x
  self.y = initPack.y
  self.hp = initPack.hp
  self.hpMax = initPack.hpMax
  self.score = initPack.score
  self.map = initPack.map

  self.draw = function(){
    if(Player.list[selfId].map !== self.map)
      return

    let hpWidth = 30 * self.hp / self.hpMax

    let width = Img.player.width
    let height = Img.player.height

    let x = self.x - Player.list[selfId].x + WIDTH/2
    let y = self.y - Player.list[selfId].y + HEIGHT/2


    ctx.fillStyle = 'red'
    ctx.fillRect(x - hpWidth / 2, y - 100 ,hpWidth,4)

    ctx.drawImage(Img.player,
      0,0,Img.player.width,Img.player.height,
      x-width/2,y-height/2,width,height)
  }

  Player.list[self.id] = self
}
Player.list = {}

let Bullet = function(initPack){
  let self = {}
  self.id = initPack.id
  self.x = initPack.x
  self.y = initPack.y
  self.map = initPack.map

  self.draw = function(){
    if(Player.list[selfId].map !== self.map)
      return

    let width = Img.bullet.width/2
    let height = Img.bullet.height/2

    let x = self.x - Player.list[selfId].x + WIDTH/2
    let y = self.y - Player.list[selfId].y + HEIGHT/2

    ctx.drawImage(Img.bullet,
      0,0,Img.bullet.width,Img.bullet.height,
      x-width/2,y-height/2,width,height)

}

  Bullet.list[self.id] = self
}
Bullet.list = {}

let selfId = null

socket.on('init', function(data){
  if(data.selfId)
    selfId = data.selfId
  for(let i = 0 ; i < data.player.length; i++){
    new Player(data.player[i])
  }
  for(let i = 0 ; i < data.bullet.length; i++){
    new Bullet(data.bullet[i])
  }
})
