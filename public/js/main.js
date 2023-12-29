const socket = io()

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const groupId = urlParams.get('groupId');
const password = urlParams.get('password')

const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')

const messageTone = new Audio('../file/message-tone.mp3')

function chatOnLoad(){
    const nameInput = document.getElementById('name-input')
    nameInput.textContent = username;
    socket.emit('joinRoom', ({username,groupId, password}))
}

socket.on('joinedRoom',function() {
    const notifi = `${username} joined Room`
    socket.emit('newJoin', ({groupId,notifi}))
})

socket.on('newJoin', (notifi) => {
    const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${notifi}</p>
        </li>
        `
    messageContainer.innerHTML += element
})
messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendMessage()
})

function sendMessage() {
    if (messageInput.value === '') return;
    const data = {
      name: username,
      message: messageInput.value,
      dateTime: new Date(),
    };
    socket.to(groupId).emit('message', data);
    addMessageToUI(true, data);
    messageInput.value = '';
}

socket.on('chat-message', (data) => {
    messageTone.play()
    addMessageToUI(false, data);
})

function addMessageToUI(isOwnMessage, data) {
  clearFeedback()
  const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
        `

  messageContainer.innerHTML += element
  scrollToBottom()
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight)
}

messageInput.addEventListener('focus', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${username} is typing a message`,
  })
})

messageInput.addEventListener('keypress', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${username} is typing a message`,
  })
})
messageInput.addEventListener('blur', (e) => {
  socket.emit('feedback', {
    feedback: '',
  })
})

socket.on('feedback', (data) => {
  clearFeedback()
  const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
  `
  messageContainer.innerHTML += element
})

function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element)
  })
}
/*********************************************************************/
$(document).ready(function () {
  var imageList = [];

  $('.input-file').change(function () {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        imageList.push(e.target.result);
        displayImages();
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  function displayImages() {
    var imageListContainer = $('#image-list-container');
    imageListContainer.empty();
    imageList.forEach(function (imageSrc) {
      var imgElement = $('<img>').attr('src', imageSrc).addClass('image-preview');
      var deleteButton = $('<span>').addClass('delete-image');
      var deleteIcon = $('<i>').addClass('fas fa-times'); 
      deleteButton.click(function () {
        deleteImage(imageSrc);
        displayImages();
      });
      deleteButton.append(deleteIcon);
      var imageItem = $('<div>').addClass('image-item').append(deleteButton).append(imgElement);
      imageItem.css('display', 'inline-block');
      imageListContainer.append(imageItem);
    });
    $('.image-label').toggle(imageList.length > 0);
  }

  $('#image-list-container').on('click', '.image-preview', function () {
    var image = document.getElementById('fullscreen-image');
    var fullscreenContainer = document.getElementById('fullscreen-container');
    image.src = this.src;
    fullscreenContainer.style.display = 'flex';
  });

  document.getElementById('close-fullscreen').addEventListener('click', function () {
    var fullscreenContainer = document.getElementById('fullscreen-container');
    fullscreenContainer.style.display = 'none';
  });

  function deleteImage(imageSrc) {
    var index = imageList.indexOf(imageSrc);
    if (index !== -1) {
      imageList.splice(index, 1);
    }
  }
});