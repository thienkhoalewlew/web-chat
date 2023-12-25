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

document.forms['formNewGroup'].addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const groupId = document.getElementById('idGroupCreate').value
    const totalClient = document.getElementById('totalClient').value
    const password = document.getElementById('password').value
    //const publicRadio = formNewGroup.querySelector('input[value="public"]');

    window.location.href = `../html/chat.html?username=${username}&groupId=${groupId}&totalClient=${totalClient}&password=${password}`;
});

document.forms['formGroup'].addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const groupId = document.getElementById('idGroupCreate').value
    const password = document.getElementById('password').value

    window.location.href = `../html/chat.html?username=${username}&groupId=${groupId}&&password=${password}`;
});
