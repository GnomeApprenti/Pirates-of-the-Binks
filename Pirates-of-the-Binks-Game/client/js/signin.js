let signDiv = document.getElementById('signDiv')
let signDivUsername = document.getElementById('signDiv-username')
let signDivPassword = document.getElementById('signDiv-password')
let signDivSignIn = document.getElementById('signDiv-signIn')
let signDivSignUp = document.getElementById('signDiv-signUp')

signDivSignIn.onclick = function(){
  socket.emit('signIn', {username:signDivUsername.value, password:signDivPassword.value})
}
signDivSignUp.onclick = function(){
  socket.emit('signUp', {username:signDivUsername.value, password:signDivPassword.value})
}

socket.on('signInResponse', function(data){
  if(data.success){
    signDiv.style.display = 'none'
    gameDiv.style.display = 'inline-block'
  }
  else {
    alert("Sign in unsuccessful")
  }
})

socket.on('signUpResponse', function(data){
  if(data.success){
    alert("Sign up successful")
  }
  else {
    alert("Sign up unsuccessful")
  }
})
