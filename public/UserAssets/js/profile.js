
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


//Div Elements
const editProfileDiv = document.getElementById('edit-profile-div');
const profileDataDiv = document.getElementById('profile-data-div');
const changeEmailDiv = document.getElementById('change-email-div');
const otpDiv = document.getElementById('otp-div');
const changePasswordDiv = document.getElementById('change-password-div');


//Buttons and link elements
const editProfileBtn = document.getElementById('edit-profile');
const changeEmail = document.getElementById('change-email');
const changePassword = document.getElementById('change-password');
const editCancelBtn = document.getElementById('edit-cancel-btn');
const emailCancelBtn = document.getElementById('email-cancel-btn');
const passwordCancelBtn = document.getElementById('password-cancel-btn');
const otpCancelBtn = document.getElementById('otp-cancel-btn');


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
    document.getElementById('email').value = '';
    document.getElementById('email-submit-btn').classList.add('disabled', 'btn-disabled');
    window.scrollTo(0, 0)
})

changePassword.addEventListener('click', () => {
    editProfileDiv.style.display = 'none';
    changePasswordDiv.style.display = 'block';
    window.scrollTo(0, 0)
})

passwordCancelBtn.addEventListener('click', () => {
    changePasswordDiv.style.display = 'none';
    editProfileDiv.style.display = 'block';
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-submit-btn').classList.add('disabled btn-disabled');
    document.getElementById('current-password-error').innerHTML = '';
    document.getElementById('new-password-error').innerHTML = '';
    document.getElementById('confirm-password-error').innerHTML = '';
    window.scrollTo(0, 0)
})

otpCancelBtn.addEventListener('click', () => {
    otpDiv.style.display = 'none';
    changeEmailDiv.style.display = 'block';
    document.getElementById('otp').value = '';
    document.getElementById('otp-submit-btn').classList.add('disabled', 'btn-disabled');
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

const profilePreview = document.getElementById('profile-pic-preview');
const profilePicInput = document.getElementById('profile-input');
document.addEventListener('DOMContentLoaded', () => {
    const changeProfilePic = document.getElementById('change-profile');
    const addProfilePic = document.getElementById('add-profile');

    const isProfileExist = changeProfilePic.getAttribute('data-profile');
    if(isProfileExist){
        addProfilePic.style.display = 'none';
    }
    else{
        changeProfilePic.style.display = 'none';
    }

    addProfilePic.addEventListener('click', () => {
        profilePicInput.click();

    })
    changeProfilePic.addEventListener('click', () => {
        profilePicInput.click();
    })
})
profilePicInput.addEventListener('change', () => {
    if(profilePicInput.files[0]){
        const imageURL = URL.createObjectURL(profilePicInput.files[0])
        profilePreview.src = imageURL;
    }
})








