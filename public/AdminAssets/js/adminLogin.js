const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValue = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const validationError = document.getElementById("validation-error");

  if (!emailRegex.test(emailValue)) {
    validationError.innerHTML = "Please enter a valid email address";
    return;
  }
  if (password.length < 8) {
    validationError.innerHTML =
      "Please Enter a valid password. Password length will be minimum 8";
    return;
  }

  try {
    const response = await fetch("/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailValue,
        password: password,
      }),
    });
    if (response.ok) {
      window.location.href = "/admin/dashboard";
    } else {
      const data = await response.json();
      validationError.innerHTML = data.error;
    }
  } catch (err) {
    console.log(err.message);
  }
});
