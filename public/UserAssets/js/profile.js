
document.addEventListener('DOMContentLoaded', () => {
    const toastMessage = localStorage.getItem("toastMessage");

  if (toastMessage) {
    Toastify({
      text: toastMessage,
      className: "success",
      gravity: "top",
      position: "center",
      style: {
        background: "#132451",
      },
    }).showToast();

    localStorage.removeItem("toastMessage");
  }
})


//Div Elements
const editProfileDiv = document.getElementById('edit-profile-div');
const profileDataDiv = document.getElementById('profile-data-div');
const changeEmailDiv = document.getElementById('change-email-div');
const changePasswordDiv = document.getElementById('change-password-div');

//Buttons and link elements
const editProfileBtn = document.getElementById('edit-profile');
const changeEmail = document.getElementById('change-email');
const changePassword = document.getElementById('change-password');
const editCancelBtn = document.getElementById('edit-cancel-btn');
const emailCancelBtn = document.getElementById('email-cancel-btn');
const passwordCancelBtn = document.getElementById('password-cancel-btn');


editProfileBtn.addEventListener('click', () => {
    profileDataDiv.style.display = 'none';
    editProfileDiv.style.display = 'block';
    window.scrollTo(0, 0)
});

editCancelBtn.addEventListener('click', () => {
    editProfileDiv.style.display = 'none';
    profileDataDiv.style.display = 'block';
    window.scrollTo(0, 0)
});

changeEmail.addEventListener('click', () => {
    editProfileDiv.style.display = 'none';
    changeEmailDiv.style.display = 'block';
    window.scrollTo(0, 0)
})

emailCancelBtn.addEventListener('click', () => {
    changeEmailDiv.style.display = 'none';
    editProfileDiv.style.display = 'block';
})

changePassword.addEventListener('click', () => {
    editProfileDiv.style.display = 'none';
    changePasswordDiv.style.display = 'block';
    window.scrollTo(0, 0)
})

passwordCancelBtn.addEventListener('click', () => {
    changePasswordDiv.style.display = 'none';
    editProfileDiv.style.display = 'block';
})


function togglePasswordVisibility(buttonClass, inputId) {
    const button = document.querySelector(buttonClass);
    const input = document.getElementById(inputId);

    button.addEventListener('click', () => {
        button.classList.toggle('fa-eye-slash');
        input.type = input.type === 'password' ? 'text' : 'password';
    });
}

togglePasswordVisibility('.toggle-current-password', 'current-password');
togglePasswordVisibility('.toggle-new-password', 'new-password');
togglePasswordVisibility('.toggle-confirm-password', 'confirm-password');
