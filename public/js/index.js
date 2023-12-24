function showFriendForm() {
    var friendForm = document.forms["formFriend"];
    var groupForm = document.forms["formGroup"];
    var newGroupForm = document.forms["formNewGroup"];

    friendForm.style.display = "block";
    groupForm.style.display = "none";
    newGroupForm.style.display = "none";
}

function showGroupForm() {
    var friendForm = document.forms["formFriend"];
    var groupForm = document.forms["formGroup"];
    var newGroupForm = document.forms["formNewGroup"];

    friendForm.style.display = "none";
    groupForm.style.display = "block";
    newGroupForm.style.display = "none";
}
function newGroupForm() {
    var newGroupForm = document.forms["formNewGroup"];
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

