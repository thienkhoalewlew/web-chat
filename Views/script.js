const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

function openFileUploader() {
  document.getElementById("file-upload").click();
}

document.getElementById("file-upload").addEventListener("change", function () {
  var fileName = this.value.split("\\").pop();
  document.getElementById("file-label").innerText = fileName || "Choose a file";
});

