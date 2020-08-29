Inventory = function(items,socket,server){

  let self = {
    items:items,
    socket:socket,
    server:server,
  }

  self.addItem = function(id,amount){
    for(let i = 0; i< self.items.length; i++){
      if(self.items[i].id === id){
        self.items[i].amount += amount
        self.refreshRenderer()
        return
      }
    }
    self.items.push({id:id,amount:amount})
    self.refreshRenderer()
  }

  self.removeItem = function(id,amount){
    for(let i = 0; i < self.items.length; i++){
      if(self.items[i].id === id){
        self.items[i].amount -= amount
        if(self.items[i].amount <= 0)
          self.items.splice(i,1)
        self.refreshRenderer()
        return
      }
    }
  }

  self.hasItem = function(id,amount){
    for(let i = 0; i < self.items.length; i++){
      if(self.items[i].id === id){
        return self.items[i].id >= amount
      }
    }
    return false
  }

  self.refreshRenderer = function(){

    if(self.server){
      self.socket.emit('updateInventory',self.items)

      self.socket.on("useItem",function(itemId){/*
        if(!self.hasItem(itemId,1)){
          console.log("Cheater")
          return
        }*/
        let item = Item.list[itemId]
        item.event(Player.list[self.socket.id])
      })
      return
    }

    let inventory = document.getElementById("inventory")
    inventory.innerHTML = ""

    let addButton = function(data){
      let item = Item.list[data.id]
      let button = document.createElement('button')
      button.innerText = item.name + " x" + data.amount
      inventory.appendChild(button)
      button.onclick = function(){
        self.socket.emit("useItem",item.id)
      }
    }
    for(let i = 0; i<self.items.length; i++){
      addButton(self.items[i])
    }
  }
  return self
}

Item = function(id,name,event){
  let self = {
    id:id,
    name:name,
    event:event,
  }
  Item.list[self.id] = self
  return self
}
Item.list = {}

Item("plank","Plank",function(player){
  player.hp = 10
  player.inventory.removeItem("plank",1)
  player.inventory.addItem("superAttack",1)
})

Item("superAttack","Attaque de la Moula",function(player){
  for(let i = 0; i <360; i++){
    player.shootBullet(i)
  }

  player.inventory.removeItem("superAttack",1)
})
