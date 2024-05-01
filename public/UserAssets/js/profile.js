const editProfileDiv = document.getElementById('edit-profile-div');
const profileDataDiv = document.getElementById('profile-data-div');
const changeEmailDiv = document.getElementById('change-email-div');
const editProfileBtn = document.getElementById('edit-profile');
const changeEmail = document.getElementById('change-email');
const editCancelBtn = document.getElementById('edit-cancel-btn');
const emailCancelBtn = document.getElementById('email-cancel-btn');

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