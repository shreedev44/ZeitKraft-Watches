const offerName = document.getElementById("offer-name");
const offerPercent = document.getElementById("offer");
const offerType = document.getElementById("offer-type");
const entity = document.getElementById("entity-name");

const offerNameError = document.getElementById("offer-name-label");
const offerPercentError = document.getElementById("offer-percent-label");
const offerTypeError = document.getElementById("offer-type-label");
const entityError = document.getElementById("entity-name-label");
const submitError = document.getElementById("submit-error");

const submitBtn = document.getElementById("add-btn");
const cancelBtn = document.getElementById("cancel-btn");

const nameRegex = /^[a-zA-Z\s]+$/;
const offerRegex = /^(?:[1-9][0-9]?|99)$/;

cancelBtn.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "/admin/offers";
});

offerType.addEventListener("click", async (event) => {
  if (
    event.target.id == "category" ||
    event.target.id == "product" ||
    event.target.id == "brand"
  ) {
    entity.classList.remove("disabled");
    while (entity.firstChild) {
      entity.removeChild(entity.firstChild);
    }
    console.log('event capture success')
    const response = await fetch(
      `/admin/fetch-entities?entityOf=${event.target.id}`,
      {
        method: "GET",
      }
    );
    if (response.ok) {
      const data = await response.json();
      console.log('got response');
      data.entities.forEach((option) => {
        let optionElem = `<option data-name="${option.name}" value="${option._id}">${option.name}</option>`;
        entity.innerHTML += optionElem;
      });
      $(document).ready(function () {
        $("#entity-name").select2();
      });
    } else if (response.status == 404) {
      Toastify({
        text: "Error fetching data",
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
  } else if (event.target.id == "select-offer") {
    entity.classList.add("disabled");
    $("#entity-name").select2("destroy");
  }
});

submitBtn.addEventListener("click", async (event) => {
  try {
    event.preventDefault();
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
    if (offerType.value == "--Select--") {
      submitError.innerHTML = "Please select an offer type";
      offerTypeError.innerHTML = "*";
      return;
    } else {
      offerTypeError.innerHTML = "";
    }
    if (!entity.value) {
      submitError.innerHTML = "Please select an offer type";
      entityError.innerHTML = "*";
      return;
    } else {
      entityError.innerHTML = "";
    }
    submitError.innerHTML = "";
    let body = {
      offerName: offerName.value.trim(),
      offerPercent: Number(offerPercent.value.trim()),
      offerType: offerType.value,
      entityName: entity.selectedOptions[0].getAttribute("data-name"),
    };
    if (offerType.value == "Category Offer") {
      body.categoryId = entity.value;
    } else if (offerType.value == "Product Offer") {
      body.productId = entity.value;
    } else if (offerType.value == "Brand Offer") {
      body.brandId = entity.value;
    } else {
      submitError.innerHTML = "Please select an offer type";
      return;
    }
    const response = await fetch("/admin/add-offer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      window.localStorage.setItem("toastMessage", "Offer added successfully");
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
