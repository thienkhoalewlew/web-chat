function showGroupForm() {
    var groupForm = document.forms["formGroup"];
    var newGroupForm = document.forms["formNewGroup"];

    groupForm.style.display = "block";
    newGroupForm.style.display = "none";
}

function showNewGroupForm() {
    var groupForm = document.forms["formGroup"];
    var newGroupForm = document.forms["formNewGroup"];

    groupForm.style.display = "none";
    newGroupForm.style.display = "block";
}

function copyID() {
    var textBox = document.getElementsByName("idGroupCreate")[0];
    textBox.select();
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    alert("Copy ID successfully!");
}

/*******************************************************/

const socket = io()

document.forms["formNewGroup"].addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const groupId = document.getElementById("idGroupCreate").value;
    const totalClient = document.getElementById("totalClient").value;
    const roomType = document.querySelector('input[name="roomType"]:checked').value;
    let password = document.getElementById("password").value;

    if(roomType=='public') password='';
    console.log(password)
    socket.emit("newGroupSubmission", {
        username,
        groupId,
        totalClient,
        password
    });
});

document.forms["formGroup"].addEventListener("submit", function(event) {
    event.preventDefault(); 

    const username = document.getElementById("username").value;
    const groupId = document.getElementsByName("groupName")[0].value;
    const password = document.getElementById('password');

    socket.emit("groupSubmission", {
        username,
        groupId,
        password
    });
});

socket.on("redirect", (url) => {
    window.location.href = url;
  });