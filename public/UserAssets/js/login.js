document.addEventListener("DOMContentLoaded", () => {
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

  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email");
    const emailError = document.getElementById("email-error");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.value.trim())) {
      emailError.innerHTML = "Please enter a valid email";
    } else {
      emailError.innerHTML = "";
      sendData();
    }

    async function sendData() {
      const form = document.getElementById("login-form");
      const formData = new FormData(form);
      const serializedFormData = JSON.stringify(Object.fromEntries(formData));
      const checkBox = document.getElementById("checkbox").checked
        ? "store"
        : "";
      try {
        const response = await fetch(`/login?cookie=${checkBox}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: serializedFormData,
        });
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("toastMessage", "Logged in as " + data.message);
          window.location.href = "/home";
        } else {
          const userError = document.getElementById("user-error");
          const data = await response.json();
          userError.innerHTML = data.message;
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  });
});
