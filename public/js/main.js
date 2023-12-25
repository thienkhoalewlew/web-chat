const socket = io()

const clientsTotal = document.getElementById('client-total') //So nguoi da ket noi
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const nameInput = document.getElementById('name-input')
  nameInput.textContent = username;

const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')

const messageTone = new Audio('../message-tone.mp3')

messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendMessage()
})

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`
})

function sendMessage() {
  if (groupIds.has(groupId) && groupIds[groupId].clientConnected.has(socket.id)) {
    if (messageInput.value === '') return;
    const data = {
      groupId: groupId,
      name: username,
      message: messageInput.value,
      dateTime: new Date(),
    };
    socket.emit('message', data);
    addMessageToUI(true, data);
    messageInput.value = '';
  }
}

socket.on('chat-message', (data) => {
  const { name, message, dateTime } = data;
  if (groupIds.has(groupId) && groupIds[groupId].clientConnected.has(socket.id)) {
    // Nếu có, hiển thị tin nhắn cho client này
    messageTone.play()
    addMessageToUI(name === username, data);
  }
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
    feedback: `✍️ ${nameInput.textContent} is typing a message`,
  })
})

messageInput.addEventListener('keypress', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.textContent} is typing a message`,
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
