//input
document.onkeydown = function(event){

  if(event.keyCode === 68) //d
    socket.emit('keyPress',{inputId:'right',state:true})
  else if(event.keyCode === 81) //q
    socket.emit('keyPress',{inputId:'left',state:true})
  else if(event.keyCode === 83) //s
    socket.emit('keyPress',{inputId:'down',state:true})
  else if(event.keyCode === 90) //z
    socket.emit('keyPress',{inputId:'up',state:true})

}

document.onkeyup = function(event){

  if(event.keyCode === 68) //d
    socket.emit('keyPress',{inputId:'right',state:false})
  else if(event.keyCode === 81) //q
    socket.emit('keyPress',{inputId:'left',state:false})
  else if(event.keyCode === 83) //s
    socket.emit('keyPress',{inputId:'down',state:false})
  else if(event.keyCode === 90) //z
    socket.emit('keyPress',{inputId:'up',state:false})

}

document.onmousedown = function(event){
  socket.emit('keyPress',{inputId:'attack',state:true})
}
document.onmouseup = function(event){
  socket.emit('keyPress',{inputId:'attack',state:false})
}

document.onmousemove = function(event){
  let x = -WIDTH/2 + event.clientX - 8
  let y = -HEIGHT/2 + event.clientY - 8
  let angle = Math.atan2(y,x) / Math.PI * 180
  socket.emit('keyPress',{inputId:'mouseAngle',state:angle})
}

document.oncontextmenu = function(event){
  event.preventDefault
}
