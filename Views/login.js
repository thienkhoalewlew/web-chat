/**************************************** */
const formLoginRegister = document.querySelector(".form-login-register");
const loginLink = document.querySelector(".login-link");
const registerLink = document.querySelector(".register-link");
const btnPopup = document.querySelector(".btnLogin-popup");
const iconClose = document.querySelector(".icon-close");

registerLink.addEventListener("click", () => {
  formLoginRegister.classList.add("active-show-register");
});
loginLink.addEventListener("click", () => {
  formLoginRegister.classList.remove("active-show-register");
});
btnPopup.addEventListener("click", () => {
  formLoginRegister.classList.add("active-popup");
});
iconClose.addEventListener("click", () => {
  formLoginRegister.classList.remove("active-popup");
  formLoginRegister.classList.remove("active-show-register");
});

const formReset = document.querySelector(".form-resetpassword");
const resetLink = document.querySelector(".reset-link");
const iconCloseReset = document.querySelector(".icon-close-reset");

resetLink.addEventListener("click", () => {
  formLoginRegister.classList.add("active-show-reset");
  formReset.classList.add("active-hidden-login");
});
iconCloseReset.addEventListener("click", () => {
  formLoginRegister.classList.remove("active-show-reset");
  formReset.classList.remove("active-hidden-login");
});


const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  try {
    const response = await fetch('http://localhost:3000/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      const userId = data.userId;
      // Chuyển đến trang main.html với userId
      window.location.href = `main.html?userId=${userId}`;
    } else {
      res.status(401).json({ message: 'Email hoặc password không đúng' });
    }
  } catch (error) {
    console.error('Lỗi:', error);
  }
});