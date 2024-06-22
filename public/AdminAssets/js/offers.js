document.addEventListener("DOMContentLoaded", () => {
  const toastMessage = window.localStorage.getItem("toastMessage");
  if (toastMessage) {
    Toastify({
      text: toastMessage,
      className: "success",
      gravity: "top",
      position: "center",
      style: {
        background: "#28a745",
      },
    }).showToast();
    window.localStorage.removeItem("toastMessage");
  }
});

const wholeDiv = document.getElementById("whole-div");
wholeDiv.addEventListener("click", async (event) => {
  if (event.target.classList.contains("activate-btn")) {
    event.preventDefault();

    let body = {
      offerId: event.target.getAttribute("data-offer-id"),
    };
    if (event.target.value == "activate") {
      body.action = true;
    } else if (event.target.value == "deactivate") {
      body.action = false;
    }
    console.log(body);
    const response = await fetch("/admin/activate-offer", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      window.localStorage.setItem(
        "toastMessage",
        `Offer ${body.action ? "activated" : "deactivated"} successfully`
      );
      location.reload();
    } else if (response.status == 404) {
      Toastify({
        text: "Error fetching offer",
        className: "danger",
        gravity: "top",
        position: "center",
        style: {
          background: "red",
        },
      }).showToast();
    } else {
      Toastify({
        text: "Internal server error",
        className: "danger",
        gravity: "top",
        position: "center",
        style: {
          background: "red",
        },
      }).showToast();
    }
  }
});
