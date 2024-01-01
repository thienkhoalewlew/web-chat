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
    const correctContainer = document.getElementById('correctContainer');
    const correctMessage = document.getElementById('correctMessage');
    correctMessage.textContent = "Copy Group ID successfully";
    correctContainer.style.display = 'flex';
    setTimeout(() => {
        closeCorrectContainer();
    }, 1500);
}
function closeErrorContainer() {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.style.display = 'none';
}
function closeCorrectContainer() {
    const correctContainer = document.getElementById('correctContainer');
    correctContainer.style.display = 'none';
}
var existingRooms = [];
function generateRandomRoom() {
    function getRandomUniqueRoom() {
        var randomRoomNumber;
        do {
            randomRoomNumber = Math.floor(Math.random() * 90000) + 10000;
        } while (existingRooms.includes(randomRoomNumber));
        return randomRoomNumber;
    }
    var randomRoomValue = getRandomUniqueRoom();
    document.getElementById("idGroupCreate").value = randomRoomValue;
}


function validateForm(usernameInput) {
    var usernameValue = usernameInput.value.trim();
    if (usernameValue === "" || usernameValue.length > 20) {
        return false;
    } else {
        return true;
    }
}
window.onload = generateRandomRoom;
/*******************************************************/

const socket = io()
const usernameInput = document.getElementById('username')
document.forms["formNewGroup"].addEventListener('submit', function (event) {
    event.preventDefault();
    var validName = validateForm(usernameInput)
    if (!validName) {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.style.display = 'flex';
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = "Username cannot contain only spaces or exceed 20 characters";
        setTimeout(() => {
            closeErrorContainer();
        }, 1500);
        return
    }
    const username = usernameInput.value
    console.log(username)
    const groupId = document.getElementById("idGroupCreate").value;
    const totalClient = document.getElementById("totalClient").value;
    const roomType = document.querySelector('input[name="roomType"]:checked').value;
    let password = document.getElementById("password").value;

    if (roomType == 'public') {
        password = '';
    }
    socket.emit('createRoom', ({ groupId, totalClient, password }))
    socket.on('roomCreated', (message) => {
        console.log('Thông báo: ' + message);
        existingRooms.push(parseInt(groupId));
        window.location.href = `/public/chat.html?username=${username}&groupId=${groupId}&password=${password}`;
    });

    socket.on('roomExisted', (message) => {
        console.log('Lỗi: ' + message);
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.style.display = 'flex';
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        setTimeout(() => {
            closeErrorContainer();
        }, 3000);
    });
});

document.forms["formGroup"].addEventListener('submit', function (event) {
    event.preventDefault();
    var validName = validateForm(usernameInput)
    if (!validName) {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.style.display = 'flex';
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = "Username cannot contain only spaces or exceed 20 characters";
        setTimeout(() => {
            closeErrorContainer();
        }, 3000);
        return
    }
    const username = usernameInput.value
    console.log(username)
    const groupId = document.getElementById("IdGroup").value;
    const password = document.getElementById('passwordJoin').value;
    window.location.href = `../chat.html?username=${username}&groupId=${groupId}&password=${password}`
});