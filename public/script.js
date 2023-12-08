const socket =io()

const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('input-message')
const messageArea = document.getElementById('message_area')

messageForm.addEventListener('submit', (e) =>{

})

function sendMessage(){
    if(messageInput.value === '') return
    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date(),
    }
    socket.emit('message', data)
    addMessageToUI(true, data)
    messageInput.value = ''
}

function addMessageToUI(isOwnMessage, data){
    const element = `
            <div class="${isOwnMessage ? "message-you" : "message-friend"}">
                <p>${data.message}</p>
                <span>${data.name} | ${data.Date}</span>
            </div>
    `
    messageArea.innerHTML += element
    scrollToBottom()
}

function scrollToBottom(){
    messageArea.scrollTo(0, messageContainer.scrollHeight)
}