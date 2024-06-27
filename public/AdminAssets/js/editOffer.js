let currOfferName;
let currOfferPercent;

const offerName = document.getElementById("offer-name");
const offerPercent = document.getElementById("offer");
const submitBtn = document.getElementById("edit-btn");
const submitError = document.getElementById("submit-error");
const offerNameError = document.getElementById("offer-name-label");
const offerPercentError = document.getElementById("offer-percent-label");

const nameRegex = /^[a-zA-Z\s]+$/;
const offerRegex = /^(?:[1-9][0-9]?|99)$/;

document.addEventListener("DOMContentLoaded", () => {
  currOfferName = offerName.value.trim();
  currOfferPercent = offerPercent.value.trim();
});

document.getElementById("cancel-btn", () => {
  window.location.href = "/admin/offers";
});

submitBtn.addEventListener("click", async (event) => {
  try {
    event.preventDefault();

    if (
      currOfferName == offerName.value.trim() &&
      currOfferName == offerPercent.value.trim()
    ) {
      submitError.innerHTML = "Cannot submit without any changes";
      return;
    }
    if (!nameRegex.test(offerName.value.trim())) {
      submitError.innerHTML = "Please enter a valid offer name (letters A - Z)";
      offerNameError.innerHTML = "*";
      return;
    } else {
      offerNameError.innerHTML = "";
    }
    if (!offerRegex.test(offerPercent.value.trim())) {
      submitError.innerHTML = "Please enter a valid offer percent (1 - 99)";
      offerPercentError.innerHTML = "*";
      return;
    } else {
      offerPercentError.innerHTML = "";
    }
    submitError.innerHTML = "";
    let body = {};
    if (currOfferName != offerName.value.trim()) {
      body.offerName = offerName.value.trim();
    }
    if (currOfferPercent != offerPercent.value.trim()) {
      body.offerPercent = offerPercent.value.trim();
    }
    const offerId = submitBtn.getAttribute("data-offer-id");
    const response = await fetch(`/admin/edit-offer?offerId=${offerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      window.localStorage.setItem("toastMessage", "Offer edited successfully");
      window.location.href = "/admin/offers";
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
  } catch (err) {
    console.log(err);
  }
});
