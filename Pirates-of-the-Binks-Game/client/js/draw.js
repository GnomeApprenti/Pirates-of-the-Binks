//draw

setInterval(function(){
  if(!selfId)
    return
  ctx.clearRect(0,0,WIDTH,HEIGHT)
  drawMap()
  drawScore()
  for(let i in Player.list)
    Player.list[i].draw(Img.player)
  for(let i in Bullet.list)
    Bullet.list[i].draw()
},40)

let drawMap = function(){
  let player = Player.list[selfId]
  let x = WIDTH/2 - player.x
  let y = HEIGHT/2 - player.y
  ctx.drawImage(Img.map[player.map],x,y)
}

let lastScore = null
let drawScore = function(){
  if(lastScore === Player.list[selfId].score)
    return
  lastScore = Player.list[selfId].score
  ctxUi.fillStyle = 'red'
  ctxUi.clearRect(0,0,WIDTH, HEIGHT)
  ctxUi.fillText(Player.list[selfId].score,0,30)
}
