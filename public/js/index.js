function showGroupForm() {
    let groupForm = document.forms["formGroup"];
    let newGroupForm = document.forms["formNewGroup"];

    groupForm.style.display = "block";
    newGroupForm.style.display = "none";
}

function showNewGroupForm() {
    let groupForm = document.forms["formGroup"];
    let newGroupForm = document.forms["formNewGroup"];

    groupForm.style.display = "none";
    newGroupForm.style.display = "block";
}

function copyID() {
    let textBox = document.getElementsByName("idGroupCreate")[0];
    textBox.select();
    navigator.clipboard.writeText(textBox.value)
        .then(() => {
            alert("Copy ID successfully!");
        })
        .catch(err => {
            console.error('Unable to copy:', err);
        });
}

/*******************************************************/

const socket = io()
const usernameInput = document.getElementById('username')

document.forms["formNewGroup"].addEventListener('submit', function(event) {
    event.preventDefault();

    const username = usernameInput.value
    console.log(username)
    const groupId = document.getElementById("idGroupCreate").value;
    const totalClient = document.getElementById("totalClient").value;
    const roomType = document.querySelector('input[name="roomType"]:checked').value;
    let password = document.getElementById("password").value;

    if (roomType == 'public') {
        password = '';
    }
    
     socket.emit('createRoom', ({groupId, totalClient, password}))

     window.location.href =`http://localhost:4000/chat.html?username=${username}&groupId=${groupId}&password=${password}`

     socket.on('passDoesNotCorrect', (message) => {
      console.log('Lỗi: ' + message);
    });
  
    socket.on('roomDoesNotExist', (message) => {
      console.log('Lỗi: ' + message); 
    });
});

document.forms["formGroup"].addEventListener('submit', function(event) {
    event.preventDefault(); 

    const username = usernameInput.value
    console.log(username)
    const groupId = document.getElementById("IdGroup").value;
    const password = document.getElementById('passwordJoin').value;

    window.location.href =`http://localhost:4000/chat.html?username=${username}&groupId=${groupId}&password=${password}`
});