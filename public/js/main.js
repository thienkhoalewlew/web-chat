const socket = io()

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const groupId = urlParams.get('groupId');
const password = urlParams.get('password')

const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')
const fileInput = document.getElementById('input-file');
const List = document.getElementById('participants-list')

const messageTone = new Audio('../file/message-tone.mp3')
const usersInGroup = [];
function chatOnLoad() {
  const nameInput = document.getElementById('name-input')
  const groupID = document.getElementById('groupID')
  nameInput.textContent = username;
  groupID.textContent = groupId;

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
      <li class="message-feedback">
        <p class="feedback" id="feedback">${notifi}</p>
      </li>
      `
  messageContainer.innerHTML += element
  scrollToBottom()
})
socket.on('joinedParticipantsList', function (participants) {
  usersInGroup.splice(0, usersInGroup.length);
  console.log('Received joinedRoom event:', participants);
  participants.forEach(user => {
    if (user.groupId === groupId) {
      usersInGroup.push(user);
    }
  });
  updateParticipantsList(usersInGroup);
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendMessage()
  sendImage()
})
socket.on('leftRoom', function (participants) {
  updateParticipantsList(participants);
});

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
let imageList = [];

$('.input-image').change(function () {
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

$('.input-file').change(function () {
  if (this.files?.[0]) {
    const file = this.files[0];
    const downloadLink = URL.createObjectURL(file);
    const fileName = file.name;
    const fileSize = file.size
    const chunkSize = 1024 * 1024 * 0.5; // 0.5MB
    const totalChunks = Math.ceil(file.size / chunkSize);

    addFileToUI(true, fileName, downloadLink);
    if (fileSize <= 1024 * 1024 * 1.5) {
      const reader = new FileReader();
      reader.onload = function (e) {
        let fileArrayBuffer = e.target.result;
        socket.emit('sendFile', { groupId, fileName, fileArrayBuffer });
      };
      reader.readAsArrayBuffer(file);
    } else {
      let offset = 0;

      const readChunk = () => {
        const blob = file.slice(offset, offset + chunkSize);
        const reader = new FileReader();

        reader.onload = function (e) {
          let fileArrayBuffer = e.target.result;
          socket.emit('sendChunk', { groupId, fileName, fileArrayBuffer, offset, totalChunks });

          if (offset + chunkSize < file.size) {
            offset += chunkSize;
            readChunk();
          }
        };

        reader.readAsArrayBuffer(blob);
      };

      readChunk();
    }
  }
});

let receivedChunks = {};

socket.on('resendChunk', (data) => {
  const { fileName, fileArrayBuffer, offset, totalChunks } = data;

  if (!receivedChunks[fileName]) {
    receivedChunks[fileName] = [];
  }

  receivedChunks[fileName][offset] = fileArrayBuffer;

  if (checkReceivedChunks(fileName, totalChunks)) {
    const mergedArrayBuffer = mergeArrayBuffers(receivedChunks[fileName]);
    const file = new Blob([mergedArrayBuffer], { type: 'application/octet-stream' });

    const downloadLink = URL.createObjectURL(file);
    addFileToUI(false, fileName, downloadLink);
  }
});

function checkReceivedChunks(fileName, totalChunks) {
  const receivedChunkCount = receivedChunks[fileName].filter(chunk => chunk).length;
  return receivedChunkCount === totalChunks;
}

function mergeArrayBuffers(arrayBuffers) {
  const totalLength = arrayBuffers.reduce((acc, curr) => acc + curr.byteLength, 0);
  const mergedArrayBuffer = new Uint8Array(totalLength);
  let offset = 0;

  arrayBuffers.forEach((buffer) => {
    mergedArrayBuffer.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });

  return mergedArrayBuffer;
}

socket.on('receivedFile', (data) => {
  const { fileName, fileArrayBuffer } = data
  const blob = new Blob([fileArrayBuffer], { type: 'application/octet-stream' });
  const blobURL = URL.createObjectURL(blob);
  messageTone.play()
  addFileToUI(false, fileName, blobURL)
})

function addFileToUI(isOwnMessage, fileName, downloadLink) {

  const element = `
    <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
      <p class="message">
        <a href="${downloadLink}" download="${fileName}" class="file-link">${fileName}</a>
      </p>
    </li>
  `;
  messageContainer.innerHTML += element;
}

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
function closeCorrectContainer() {
  const correctContainer = document.getElementById('correctContainer');
  correctContainer.style.display = 'none';
} function closeCorrectContainer() {
  const correctContainer = document.getElementById('correctContainer');
  correctContainer.style.display = 'none';
}
function closeCofirmContainer() {
  const confirmLeave = document.getElementById('confirmLeave');
  confirmLeave.style.display = 'none';
}
function copyID() {
  var groupIDValue = document.getElementById("groupID").innerText;
  var textarea = document.createElement("textarea");
  textarea.value = groupIDValue;
  document.body.appendChild(textarea);
  textarea.select();
  navigator.clipboard.writeText(textarea.value)
  document.body.removeChild(textarea);
  const correctContainer = document.getElementById('correctContainer');
  const correctMessage = document.getElementById('correctMessage');
  correctMessage.textContent = "Copy Group ID successfully";
  correctContainer.style.display = 'flex';
  setTimeout(() => {
    closeCorrectContainer();
  }, 1500);
}
function updateParticipantsList(participants) {
  const participantsList = document.getElementById('participants-list');
  participantsList.innerHTML = '';
  participants.forEach(user => {
    const participantElement = document.createElement('div');
    participantElement.classList.add('participant');
    const userIcon = document.createElement('span');
    userIcon.innerHTML = '<i class="far fa-user"></i>';
    participantElement.appendChild(userIcon);
    const userNameLabel = document.createElement('label');
    userNameLabel.classList.add('name-input');
    userNameLabel.textContent = user.username;
    participantElement.appendChild(userNameLabel);
    participantsList.appendChild(participantElement);
  });
}
function confirmLeave() {
  const confirmLeave = document.getElementById('confirmLeave');
  confirmLeave.style.display = 'flex';
}
function leaveRoom() {
  const notifi = `${username} left the Room`
  socket.emit('newJoin', ({ groupId, notifi }))
  window.history.back();
}

