const form = document.getElementById("reset-password-form");
const newPassword = document.getElementById("new-password");
const confPassword = document.getElementById("confirm-password");
const passwordError = document.getElementById("password-error");

//regex
const minLengthRegex = /^.{8,}$/;
const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
const numberRegex = /\d/;

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newPasswordValue = newPassword.value.trim();
  const confPasswordValue = confPassword.value.trim();
  const userEmail = document
    .getElementById("reset-submit-btn")
    .getAttribute("data-user-id");
  let passwordValidated = true;

  if (!minLengthRegex.test(newPasswordValue)) {
    passwordError.innerHTML = "The password must contain min 8 characters";
    passwordValidated = false;
  } else if (!specialCharRegex.test(newPasswordValue)) {
    passwordError.innerHTML = "The password must contain a special character";
    passwordValidated = false;
  } else if (!numberRegex.test(newPasswordValue)) {
    passwordError.innerHTML = "The password must contain a number";
    passwordValidated = false;
  }

  if (newPasswordValue != confPasswordValue) {
    passwordError.innerHTML = "Passwords do not match";
    passwordValidated = false;
  }

  if (passwordValidated) {
    const response = await fetch(`/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: newPasswordValue,
        email: userEmail,
      }),
    });

    if (response.ok) {
      localStorage.setItem("toastMessage", "Password updated successfully");
      window.location.href = "/login";
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
