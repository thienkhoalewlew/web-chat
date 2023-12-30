const socket = io()

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const groupId = urlParams.get('groupId');
const password = urlParams.get('password')

const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')

const messageTone = new Audio('../file/message-tone.mp3')

function chatOnLoad() {
  const nameInput = document.getElementById('name-input')
  nameInput.textContent = username;
  socket.emit('joinRoom', ({ username, groupId, password }))
  socket.on('passDoesNotCorrect', (message) => {
    console.log('Lỗi: ' + message);
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorContainer.style.display = 'flex';
    setTimeout(() => {
      closeErrorContainer();
    }, 1500);
  });

  socket.on('roomDoesNotExist', (message) => {
    console.log('Lỗi: ' + message);
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorContainer.style.display = 'flex';
    setTimeout(() => {
      closeErrorContainer();
    }, 1500);
  });
}

socket.on('joinedRoom', function () {
  const notifi = `${username} joined Room`
  socket.emit('newJoin', ({ groupId, notifi }))
})

socket.on('newJoin', (notifi) => {
  const element = `
        <li class="notifi-newJoin">
          <p class="notifi-newJoin" id="notifi-newJoin">${notifi}</p>
        </li>
        `
  messageContainer.innerHTML += element
})
messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendMessage()
  sendImage()
})

function sendMessage() {
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

socket.on('newImage', (imageList) => {
  messageTone.play()
  addImageToUI(false, imageList);
});

function addImageToUI(isOwnMessage, imageBase64List) {
  $('.image-label').hide();
  imageBase64List.forEach(function (imageBase64) {
    const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
        <p class="message-image">
          <img src="${imageBase64}" class="message-image-item">
        </p>
      </li>
    `;
    messageContainer.innerHTML += element;
  });

  $('.message-image-item').on('click', function () {
    let image = document.getElementById('fullscreen-image');
    let fullscreenContainer = document.getElementById('fullscreen-container');
    image.src = this.src;
    fullscreenContainer.style.display = 'flex';
  });
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight)
}

messageInput.addEventListener('focus', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  })
})

messageInput.addEventListener('keypress', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
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
let imageList = [];

$('.input-file').change(function () {
  if (this.files?.[0]) {
    let reader = new FileReader();
    reader.onload = function (e) {
      let imageBase64 = e.target.result;
      imageList.push(imageBase64);
      displayImages();
    };

    reader.readAsDataURL(this.files[0]);
  }
});

function displayImages() {
  let imageListContainer = $('#image-list-container');
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
    let imageItem = $('<div>').addClass('image-item').append(deleteButton).append(imgElement);
    imageItem.css('display', 'inline-block');
    imageListContainer.append(imageItem);
  });
  $('.image-label').toggle(imageList.length > 0);
}

function sendImage() {
  if (imageList.length > 0) {
    socket.emit('dataImage', ({ groupId, imageList }));
    addImageToUI(true, imageList)
    $('#image-list-container').empty();
    imageList = [];
    $('#image-list-container').empty();
  }
}

$('#image-list-container').on('click', '.image-preview', function () {
  let image = document.getElementById('fullscreen-image');
  let fullscreenContainer = document.getElementById('fullscreen-container');
  image.src = this.src;
  fullscreenContainer.style.display = 'flex';
});

document.getElementById('close-fullscreen').addEventListener('click', function () {
  let fullscreenContainer = document.getElementById('fullscreen-container');
  fullscreenContainer.style.display = 'none';
});

function deleteImage(imageSrc) {
  let index = imageList.indexOf(imageSrc);
  if (index !== -1) {
    imageList.splice(index, 1);
  }
}
function closeErrorContainer() {
  const errorContainer = document.getElementById('errorContainer');
  errorContainer.style.display = 'none';
  window.history.back();
}

