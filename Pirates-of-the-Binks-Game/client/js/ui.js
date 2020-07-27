//UI

let changeMap = function(){
  socket.emit('changeMap')
}

let inventory = new Inventory(null)
socket.on('updateInventory',function(items){
  inventory.items = items
  inventory.refreshRenderer()
})
