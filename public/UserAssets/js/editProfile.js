function debounce(func, delay) {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

//input elements
const fName = document.getElementById("first-name");
const lName = document.getElementById("last-name");
const phone = document.getElementById("phone");

//error elements
const fNameError = document.getElementById("fname-error");
const lNameError = document.getElementById("lname-error");
const phoneError = document.getElementById("phone-error");

let initialFName, initialLName, initialPhone;

document.addEventListener("DOMContentLoaded", () => {
  initialFName = fName.value.trim();
  initialLName = lName.value.trim();
  initialPhone = phone.value.trim();
});

const profileSubmitBtn = document.getElementById("profile-submit-btn");

const checkInput = () => {
  if (
    initialFName != fName.value.trim() ||
    initialLName != lName.value.trim() ||
    initialPhone != phone.value.trim() || 
    profilePicInput.files[0]
  ) {
    profileSubmitBtn.classList.remove("disabled", "btn-disabled");
  } else {
    profileSubmitBtn.classList.add("disabled", "btn-disabled");
  }
};

const debounceCheckInput = debounce(checkInput, 500);

fName.addEventListener("input", debounceCheckInput);
lName.addEventListener("input", debounceCheckInput);
phone.addEventListener("input", debounceCheckInput);
profilePicInput.addEventListener('change', debounceCheckInput);

//regex
const nameRegex = /^[a-zA-Z]+$/;
const countryCodes = {
  "+1": /^\+1\s?\d{10}$/,
  "+91": /^\+91\s?\d{10}$/,
};

// Test the regular expression with sample phone numbers
function validatePhoneNumber(phoneNumber) {
  for (const [code, regex] of Object.entries(countryCodes)) {
    if (regex.test(phoneNumber)) {
      return true;
    }
  }

  return false;
}
const allowedExtensions = new Set(["jpg", "jpeg", "png"]);
let validated = true;

profileSubmitBtn.addEventListener("click", async () => {

  if (fName.value.trim().length == 0) {
    fNameError.innerHTML = "First name cannot be empty";
    validated = false;
  }
  else{
    fNameError.innerHTML = '';
  }
  if (!nameRegex.test(fName.value.trim())) {
    fNameError.innerHTML = "Name can only contain letters A - Z";
    validated = false;
  }

  else{
    fNameError.innerHTML = '';
  }
  if (lName.value.trim().length == 0) {
    lNameError.innerHTML = "Last name cannot be empty";
    validated = false;
  }
  else{
    lNameError.innerHTML = '';
  }
  if (!nameRegex.test(lName.value.trim())) {
    lNameError.innerHTML = "Name can only contain letters A - Z";
    validated = false;
  }
  else{
    lNameError.innerHTML = '';
  }
  if (
    !validatePhoneNumber(phone.value.trim()) &&
    phone.value.trim().length != 0
  ) {
    phoneError.innerHTML = "Enter a valid phone number with country code";
    validated = false;
  }
  else{
    phoneError.innerHTML = '';
  }
  if(profilePicInput.files[0]){
    const file = profilePicInput.files[0];
    const fileType = file.type;
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if(!(allowedExtensions.has(fileExtension))){
      Toastify({
        text: "File must be type of jpg/png",
        className: "danger",
        gravity: 'top',
        position: 'center',
        style: {
          background: "red",
        }
      }).showToast();
      validated = false;
    }
    else if(file.size > 5 * 1024 * 1024){
      Toastify({
        text: "File size must be below 5MB",
        className: "danger",
        gravity: 'top',
        position: 'center',
        style: {
          background: "red",
        }
      }).showToast();
      validated = false;
    }
  }
  if(validated){
      const userId = profileSubmitBtn.getAttribute('data-user-id');
      let formData = new FormData();
      if(initialFName != fName.value.trim()){
        formData.append('firstName', fName.value.trim());
        }
        if(initialLName != lName.value.trim()){
          formData.append('lastName', lName.value.trim())
        }
        if(initialPhone != phone.value.trim()){
          formData.append('phone', phone.value.trim())
        }
        if(profilePicInput.files[0]){
          formData.append('profilePic', profilePicInput.files[0]);
        }
        
    const response = await fetch(`/update-profile?userId=${userId}`, {
        method: 'PATCH',
        body: formData,
    });
    if(response.ok){
        localStorage.setItem('toastMessage', 'Profile updated successfully');
        location.reload();
        window.scrollTo(0, 0)
    }
    else{
        Toastify({
            text: "Internal server error",
            className: "danger",
            gravity: 'top',
            position: 'center',
            style: {
              background: "red",
            }
          }).showToast();
    }
  }
});

const emailSubmitBtn = document.getElementById('email-submit-btn');
const emailInput = document.getElementById('email');

const checkEmailInput = () => {
  if(emailInput.value.trim() != 0){
    emailSubmitBtn.classList.remove('btn-disabled', 'disabled');
  }
  else{
    emailSubmitBtn.classList.add('btn-disabled', 'disabled');
  }
}

const debouncedCheckEmail = debounce(checkEmailInput, 500);

emailInput.addEventListener('input', debouncedCheckEmail);

emailSubmitBtn.addEventListener('click', () => {
  alert('hello')
})
