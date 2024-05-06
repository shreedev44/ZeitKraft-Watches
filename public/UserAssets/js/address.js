function debounce(func, delay) {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

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

//Div elements
const addAddressDiv = document.getElementById("add-address-div");
const addressesDiv = document.getElementById("addresses-div");
const addressesWholeDiv = document.getElementById('addresses-whole-div')

//Button elements
const addAddressBtn = document.getElementById("add-address-btn");
const addAddressCancelBtn = document.getElementById("add-address-cancel-btn");
const addAddressSubmitBtn = document.getElementById("add-address-submit-btn");
const deleteAddressBtn = document.getElementById("delete-address-btn");
const editAddressBtn = document.getElementById("edit-address-btn");

//Add address input elements
const addFName = document.getElementById("add-first-name");
const addLName = document.getElementById("add-last-name");
const addState = document.getElementById("add-state");
const addStreetAddress = document.getElementById("add-street-address");
const addCity = document.getElementById("add-city");
const addPin = document.getElementById("add-pin");
const addPhone = document.getElementById("add-phone");

//Add address errors
const addFNameError = document.getElementById("add-fname-error");
const addLNameError = document.getElementById("add-lname-error");
const addStateError = document.getElementById("add-state-error");
const addStreetAddressError = document.getElementById(
  "add-street-address-error"
);
const addCityError = document.getElementById("add-city-error");
const addPinError = document.getElementById("add-pin-error");
const addPhoneError = document.getElementById("add-phone-error");

//regex
const nameRegex = /^[a-zA-Z]+$/;
const pinRegex = /^[0-9]{6}$/;
const addressRegex = /^[a-zA-Z0-9\s,-.]+/;
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

//Div handling
addAddressBtn.addEventListener("click", () => {
  addressesDiv.style.display = "none";
  addAddressDiv.style.display = "block";
  window.scrollTo(0, 0);
});

addAddressCancelBtn.addEventListener("click", () => {
  addAddressDiv.style.display = "none";
  addressesDiv.style.display = "block";
  window.scrollTo(0, 0);
});

//Add address handling
const checkAddAddressInput = () => {
  if (
    addFName.value.trim().length != 0 &&
    addLName.value.trim().length != 0 &&
    addState.value.trim().length != 0 &&
    addStreetAddress.value.trim().length != 0 &&
    addCity.value.trim().length != 0 &&
    addPin.value.trim().length != 0 &&
    addPhone.value.trim().length != 0
  ) {
    addAddressSubmitBtn.classList.remove("disabled", "btn-disabled");
  } else {
    addAddressSubmitBtn.classList.add("disabled", "btn-disabled");
  }
};

const debouncedAddAddress = debounce(checkAddAddressInput, 500);

addFName.addEventListener("input", debouncedAddAddress);
addLName.addEventListener("input", debouncedAddAddress);
addState.addEventListener("input", debouncedAddAddress);
addStreetAddress.addEventListener("input", debouncedAddAddress);
addCity.addEventListener("input", debouncedAddAddress);
addPin.addEventListener("input", debouncedAddAddress);
addPhone.addEventListener("input", debouncedAddAddress);

addAddressSubmitBtn.addEventListener("click", async () => {
  let validated = true;
  if (!nameRegex.test(addFName.value.trim())) {
    addFNameError.innerHTML = "Name can only contain letters A - Z";
    validated = false;
  }
  if (!nameRegex.test(addLName.value.trim())) {
    addLNameError.innerHTML = "Name can only contain letters A - Z";
    validated = false;
  }
  if (
    !nameRegex.test(addState.value.trim()) ||
    addState.value.trim().length < 3
  ) {
    addStateError.innerHTML = "Please enter a valid state";
    validated = false;
  }
  if (!addressRegex.test(addStreetAddress.value.trim())) {
    addStreetAddressError.innerHTML = "Please enter a valid street address";
    validated = false;
  } else if (addStreetAddress.value.trim().length < 10) {
    addStreetAddressError.innerHTML = "Address is too short";
    validated = false;
  }
  if (
    !nameRegex.test(addCity.value.trim()) ||
    addCity.value.trim().length < 3
  ) {
    addCityError.innerHTML = "Please enter a valid city/town";
    validated = false;
  }
  if (!pinRegex.test(addPin.value.trim())) {
    addPinError.innerHTML = "PIN Code should contain 6 numbers";
    validated = false;
  }
  if (!validatePhoneNumber(addPhone.value.trim())) {
    addPhoneError.innerHTML = "Enter a valid phone number with country code";
    validated = false;
  }

  if (validated) {
    try {
      const response = await fetch(`/add-address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: addFName.value.trim(),
          lastName: addLName.value.trim(),
          state: addState.value.trim(),
          streetAddress: addStreetAddress.value.trim(),
          city: addCity.value.trim(),
          pinCode: addPin.value.trim(),
          phone: addPhone.value.trim(),
        }),
      });
      if (response.ok) {
        localStorage.setItem("toastMessage", "Address added successfully");
        window.scrollTo(0, 0);
        location.reload();
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
    } catch (err) {
      console.log(err.message);
    }
  }
});


//delete address handling
addressesWholeDiv.addEventListener('click', async (event) => {
    if(event.target.id == 'delete-address-btn'){
        const addressId = deleteAddressBtn.getAttribute("data-address-id");
        try {
          Swal.fire({
            background: "#fff",
            title: "Are you sure you want to delete this Address?",
            text: "There is no reverting this action",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#132451",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const response = await fetch(`/delete-address?addressId=${addressId}`, {
                method: "DELETE",
              });
        
              if (response.ok) {
                localStorage.setItem("toastMessage", "Address deleted successfully");
                location.reload();
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
        } catch (err) {
          console.log(err.message);
        }
    }
})
