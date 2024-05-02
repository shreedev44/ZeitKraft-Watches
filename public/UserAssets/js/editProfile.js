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
    initialPhone != phone.value.trim()
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

profileSubmitBtn.addEventListener("click", async () => {
    let validated = true;

  if (fName.value.trim().length == 0) {
    fNameError.innerHTML = "First name cannot be empty";
    validated = false;
  }
  else{
    fNameError.innerHTML = '';
    validated = true;
  }
  if (!nameRegex.test(fName.value.trim())) {
    fNameError.innerHTML = "Name can only contain letters A - Z";
    validated = false;
  }

  else{
    fNameError.innerHTML = '';
    validated = true;
  }
  if (lName.value.trim().length == 0) {
    lNameError.innerHTML = "Last name cannot be empty";
    validated = false;
  }
  else{
    lNameError.innerHTML = '';
    validated = true;
  }
  if (!nameRegex.test(lName.value.trim())) {
    lNameError.innerHTML = "Name can only contain letters A - Z";
    validated = false;
  }
  else{
    lNameError.innerHTML = '';
    validated = true;
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
    validated = true;
  }
  if(validated){
      const userId = profileSubmitBtn.getAttribute('data-user-id');
      let body = {};
      if(initialFName != fName.value.trim()){
          body.firstName = fName.value.trim();
        }
        if(initialLName != lName.value.trim()){
            body.lastName = lName.value.trim();
        }
        if(initialPhone != phone.value.trim()){
            body.phone = phone.value.trim();
        }
    const response = await fetch(`/update-profile?userId=${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
    });
    if(response.ok){
        localStorage.setItem('toastMessage', 'Logged in as ' + data.message);
        location.reload();
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
