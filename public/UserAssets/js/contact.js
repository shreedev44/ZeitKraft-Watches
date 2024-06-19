const nameRegex = /^[a-zA-Z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = document.getElementById("contact-form");
form.addEventListener("submit", async (event) => {
  try {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const subjectError = document.getElementById("subject-error");
    const messageError = document.getElementById("message-error");
    const submitError = document.getElementById("submit-error");

    let validated = true;
    if (!nameRegex.test(name)) {
      nameError.innerHTML = "*";
      submitError.innerHTML = "Please enter a valid name (letters A - Z)";
      validated = false;
    } else {
      nameError.innerHTML = "";
    }
    if (!emailRegex.test(email)) {
      emailError.innerHTML = "*";
      submitError.innerHTML = "Please enter a valid email";
      validated = false;
    } else {
      nameError.innerHTML = "";
    }
    if (subject.length < 3) {
      subjectError.innerHTML = "*";
      submitError.innerHTML = "Please enter a valid subject";
      validated = false;
    } else {
      subjectError.innerHTML = "";
    }
    if (message.length < 3) {
      messageError.innerHTML = "*";
      submitError.innerHTML = "Please enter a valid message";
      validated = false;
    } else {
      messageError.innerHTML = "";
    }

    if (validated) {
      submitError.innerHTML = "";
      const response = await fetch("https://formspree.io/f/xrbzzzbq", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          subject: subject,
          message: message,
        }),
      });
      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Your message has been sent successfully",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        }).then(async (result) => {
          location.reload();
        });
      } else {
        Swal.fire({
          title: "Failed!",
          text: "Something went wrong while submission",
          icon: "error",
          timer: 3000,
          showConfirmButton: false,
        }).then(async (result) => {
          location.reload();
        });
      }
    }
  } catch (err) {
    console.log(er);
  }
});
