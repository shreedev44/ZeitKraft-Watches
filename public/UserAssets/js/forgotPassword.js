const form = document.getElementById("forgot-password-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailInput = document.getElementById("email");
  const emailError = document.getElementById("email-error");
  if (!emailRegex.test(emailInput.value.trim())) {
    emailError.innerHTML = "Please enter a valid email";
  } else {
    emailError.innerHTML = "";
    const response = await fetch(`/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: emailInput.value.trim() }),
    });
    if (response.ok) {
      form.style.display = "none";
      document.getElementById(
        "email-message"
      ).innerHTML = `An email has been sent to ${emailInput.value.trim()} with a link to reset your password`;
    }
    else{
        emailError.innerHTML = 'Cannot send the link at the moment'
    }
  }
});
