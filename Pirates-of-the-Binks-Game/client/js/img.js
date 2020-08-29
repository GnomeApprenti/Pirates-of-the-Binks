let Img = {}
Img.player = new Image()
Img.player.src = '/client/img/boat.png'
Img.bullet = new Image()
Img.bullet.src = '/client/img/bullet.png'
Img.map = {}
Img.map['sea'] = new Image()
Img.map['sea'].src = 'client/img/sea.jpg'
Img.map['coast'] = new Image()
Img.map['coast'].src = 'client/img/coast.png'

let ctx = document.getElementById("ctx").getContext("2d")
let ctxUi = document.getElementById("ctx-ui").getContext("2d")
ctx.font = "30px Arial"
ctxUi.font = "30px Arial"
