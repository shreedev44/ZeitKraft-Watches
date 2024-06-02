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
profilePicInput.addEventListener("change", debounceCheckInput);

//regex
const nameRegex = /^[a-zA-Z]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpRegex = /^[0-9]{6}$/;
const minLengthRegex = /^.{8,}$/;
const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
const numberRegex = /\d/;
const countryCodes = {
  "+1": /^\+1\s?\d{10}$/,
  "+91": /^\+91\s?\d{10}$/,
};
function validatePhoneNumber(phoneNumber) {
  for (const [code, regex] of Object.entries(countryCodes)) {
    if (regex.test(phoneNumber)) {
      return true;
    }
  }

  return false;
}
const allowedExtensions = new Set(["jpg", "jpeg", "png"]);

profileSubmitBtn.addEventListener("click", async () => {
  let validated = true;
  if (fName.value.trim().length == 0) {
    fNameError.innerHTML = "First name cannot be empty";
    validated = false;
  } else {
    fNameError.innerHTML = "";
  }
  if (!nameRegex.test(fName.value.trim())) {
    fNameError.innerHTML = "Name can only contain letters A - Z";
    validated = false;
  } else {
    fNameError.innerHTML = "";
  }
  if (lName.value.trim().length == 0) {
    lNameError.innerHTML = "Last name cannot be empty";
    validated = false;
  } else {
    lNameError.innerHTML = "";
  }
  if (!nameRegex.test(lName.value.trim())) {
    lNameError.innerHTML = "Name can only contain letters A - Z";
    validated = false;
  } else {
    lNameError.innerHTML = "";
  }
  if (
    !validatePhoneNumber(phone.value.trim()) &&
    phone.value.trim().length != 0
  ) {
    phoneError.innerHTML = "Enter a valid phone number with country code";
    validated = false;
  } else {
    phoneError.innerHTML = "";
  }
  if (profilePicInput.files[0]) {
    const file = profilePicInput.files[0];
    const fileType = file.type;
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.has(fileExtension)) {
      Toastify({
        text: "File must be type of jpg/png",
        className: "danger",
        gravity: "top",
        position: "center",
        style: {
          background: "red",
        },
      }).showToast();
      validated = false;
    } else if (file.size > 5 * 1024 * 1024) {
      Toastify({
        text: "File size must be below 5MB",
        className: "danger",
        gravity: "top",
        position: "center",
        style: {
          background: "red",
        },
      }).showToast();
      validated = false;
    }
  }
  if (validated) {
    const userId = profileSubmitBtn.getAttribute("data-user-id");
    let formData = new FormData();
    if (initialFName != fName.value.trim()) {
      formData.append("firstName", fName.value.trim());
    }
    if (initialLName != lName.value.trim()) {
      formData.append("lastName", lName.value.trim());
    }
    if (initialPhone != phone.value.trim()) {
      formData.append("phone", phone.value.trim());
    }
    if (profilePicInput.files[0]) {
      formData.append("profilePic", profilePicInput.files[0]);
    }

    const response = await fetch(`/update-profile?userId=${userId}`, {
      method: "PATCH",
      body: formData,
    });
    if (response.ok) {
      localStorage.setItem("toastMessage", "Profile updated successfully");
      location.reload();
      window.scrollTo(0, 0);
    } else {
      Toastify({
        text: "Internal server error",
        className: "danger",
        gravity: "top",
        position: "center",
        style: {
          background: "#dc3545",
        },
      }).showToast();
    }
  }
});

const emailSubmitBtn = document.getElementById("email-submit-btn");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("email-error");

const checkEmailInput = () => {
  if (emailInput.value.trim() != 0) {
    emailSubmitBtn.classList.remove("btn-disabled", "disabled");
  } else {
    emailSubmitBtn.classList.add("btn-disabled", "disabled");
  }
};

const debouncedCheckEmail = debounce(checkEmailInput, 500);

emailInput.addEventListener("input", debouncedCheckEmail);

emailSubmitBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const currentEmail = emailSubmitBtn.getAttribute("data-current-email");
  const userId = emailSubmitBtn.getAttribute("data-user-id");

  if (!emailRegex.test(emailInput.value.trim())) {
    emailError.innerHTML = "Please enter a valid email";
  } else if (emailInput.value.trim() == currentEmail) {
    emailError.innerHTML = "You cannot change email to the current one";
  } else {
    const response = await fetch(`/change-email?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailInput.value.trim(),
      }),
    });

    if (response.ok) {
      changeEmailDiv.style.display = "none";
      otpDiv.style.display = "block";
    } else if (response.status == 400) {
      otpDiv.style.display = "none";
      changeEmailDiv.style.display = "block";
      emailError.innerHTML = "Email already in use";
    } else {
      otpDiv.style.display = "none";
      changeEmailDiv.style.display = "block";
      Toastify({
        text: "Unable to send OTP at the moment",
        className: "danger",
        gravity: "top",
        position: "center",
        style: {
          background: "#dc3545",
        },
      }).showToast();
    }
  }
});

const otpSubmitBtn = document.getElementById("otp-submit-btn");
const otpError = document.getElementById("otp-error");
const otpInput = document.getElementById("otp");

const checkOtpInput = () => {
  if (otpInput.value.trim() != 0) {
    otpSubmitBtn.classList.remove("btn-disabled", "disabled");
  } else {
    otpSubmitBtn.classList.add("btn-disabled", "disabled");
  }
};

const debouncedCheckOtp = debounce(checkOtpInput, 500);

otpInput.addEventListener("input", debouncedCheckOtp);

otpSubmitBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const userId = otpSubmitBtn.getAttribute("data-user-id");
  if (!otpRegex.test(otpInput.value.trim())) {
    otpError.innerHTML = "Please enter a valid otp (only numbers)";
  } else {
    const response = await fetch(`/email-change-otp?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        otp: otpInput.value.trim(),
      }),
    });
    if (response.ok) {
      localStorage.setItem("toastMessage", "Email updated successfully");
      location.reload();
      window.scrollTo(0, 0);
    } else if ((response.status = 400)) {
      otpError.innerHTML = "Incorrect OTP";
    } else {
      Toastify({
        text: "Internal server error",
        className: "danger",
        gravity: "top",
        position: "center",
        style: {
          background: "#dc3545",
        },
      }).showToast();
    }
  }
});

const currPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const confPasswordInput = document.getElementById("confirm-password");

const currPasswordError = document.getElementById("current-password-error");
const newPasswordError = document.getElementById("new-password-error");
const confPasswordError = document.getElementById("confirm-password-error");

const passwordSubmitBtn = document.getElementById("password-submit-btn");

const checkPassword = () => {
  if (
    currPasswordInput.value.trim().length != 0 &&
    newPasswordInput.value.trim().length != 0 &&
    confPasswordInput.value.trim().length != 0
  ) {
    passwordSubmitBtn.classList.remove("disabled", "btn-disabled");
  } else {
    passwordSubmitBtn.classList.add("disabled", "btn-disabled");
  }
};

const debouncedCheckPassword = debounce(checkPassword, 500);

currPasswordInput.addEventListener('input', debouncedCheckPassword);
newPasswordInput.addEventListener('input', debouncedCheckPassword);
confPasswordInput.addEventListener('input', debouncedCheckPassword);

passwordSubmitBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  const newPasswordValue = newPasswordInput.value.trim();
  const confPasswordValue = confPasswordInput.value.trim();
  let passwordValidated = true;
  if(!(minLengthRegex.test(newPasswordValue))){
    newPasswordError.innerHTML = 'The password must contain min 8 characters';
    passwordValidated = false;
  }
  else if(!(specialCharRegex.test(newPasswordValue))){
    newPasswordError.innerHTML = 'The password must contain a special character';
    passwordValidated = false;
  }
  else if(!(numberRegex.test(newPasswordValue))){
    newPasswordError.innerHTML = 'The password must contain a number';
    passwordValidated = false;
  }
  else{
    if(newPasswordValue == currPasswordInput.value.trim()){
      newPasswordError.innerHTML = 'New password cannot be the old password';
      passwordValidated = false;
    }
    else{
      newPasswordError.innerHTML = '';
    }
  }


  if(newPasswordValue != confPasswordValue){
    confPasswordError.innerHTML = 'Passwords do not match';
    passwordValidated = false;
  }
  else{
    confPasswordError.innerHTML = '';
  }
  if(passwordValidated){
    const userId = passwordSubmitBtn.getAttribute('data-user-id')
    const response = await fetch(`/change-password?userId=${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword: currPasswordInput.value.trim(),
        password: newPasswordValue
      })
    });
    if(response.ok){
      localStorage.setItem("toastMessage", "Password updated successfully");
      location.reload();
      window.scrollTo(0, 0);
    }
    else if(response.status == 400){
      currPasswordError.innerHTML = 'Wrong current password';
    }
    else{
      Toastify({
        text: "Internal server error",
        className: "danger",
        gravity: "top",
        position: "center",
        style: {
          background: "#dc3545",
        },
      }).showToast();
    }
  }

})
