const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

const name = prompt('What is your name?');
appendMessage('You Joined.',true)
socket.emit('new-user',name)

socket.on('user-connected',name=>{
    appendMessage(`${name} connected`,false)
})

socket.on('user-disconnected',name=>{
    appendMessage(`${name} disconnected`,false)
})

socket.on('chat-message', data=> {
    appendMessage(`${data.name}: ${data.message}.`,false)
})

messageForm.addEventListener('submit', e=>{
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`You: ${message}.`,true)
    socket.emit('send-chat-message',message)
    messageInput.value = ''
})

function appendMessage(message, byMe){
    const messageElement = document.createElement('div')
    messageElement.className=(byMe)?'col-md-8 alert alert-success':'col-md-8 alert alert-dark'
    messageElement.style=(byMe)?'float:right;':'float:left;'
    messageElement.innerText = message;
    messageContainer.append(messageElement)
}//appendMessage