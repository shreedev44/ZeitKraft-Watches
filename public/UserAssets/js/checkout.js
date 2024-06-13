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

const addAddressBtn = document.getElementById("add-address-btn");
const addAddressDiv = document.getElementById("add-address-div");
const addAddressCancelBtn = document.getElementById("add-address-cancel-btn");
const addAddressSubmitBtn = document.getElementById("add-address-submit-btn");

//Add address input elements
const fName = document.getElementById("add-first-name");
const lName = document.getElementById("add-last-name");
const state = document.getElementById("add-state");
const streetAddress = document.getElementById("add-street-address");
const city = document.getElementById("add-city");
const pin = document.getElementById("add-pin");
const phone = document.getElementById("add-phone");

//Add address errors
const fNameError = document.getElementById("add-fname-error");
const lNameError = document.getElementById("add-lname-error");
const stateError = document.getElementById("add-state-error");
const streetAddressError = document.getElementById("add-street-address-error");
const cityError = document.getElementById("add-city-error");
const pinError = document.getElementById("add-pin-error");
const phoneError = document.getElementById("add-phone-error");

//regex
const nameRegex = /^[a-zA-Z]+$/;
const pinRegex = /^[2-9]\d{5}$/;
const addressRegex = /^[ a-zA-Z0-9\s,-.]+/;
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

addAddressBtn.addEventListener("click", (event) => {
  event.preventDefault();

  addAddressBtn.style.display = "none";
  addAddressDiv.style.display = "block";
});

addAddressCancelBtn.addEventListener("click", (event) => {
  event.preventDefault();

  addAddressDiv.style.display = "none";
  addAddressBtn.style.display = "inline";
  window.scrollTo(0, 0);
});

const checkAddAddressInput = () => {
  if (
    fName.value.trim().length != 0 &&
    lName.value.trim().length != 0 &&
    state.value.trim().length != 0 &&
    streetAddress.value.trim().length != 0 &&
    city.value.trim().length != 0 &&
    pin.value.trim().length != 0 &&
    phone.value.trim().length != 0
  ) {
    addAddressSubmitBtn.classList.remove("disabled", "btn-disabled");
  } else {
    addAddressSubmitBtn.classList.add("disabled", "btn-disabled");
  }
};

const debouncedAddAddress = debounce(checkAddAddressInput, 300);

fName.addEventListener("input", debouncedAddAddress);
lName.addEventListener("input", debouncedAddAddress);
state.addEventListener("input", debouncedAddAddress);
streetAddress.addEventListener("input", debouncedAddAddress);
city.addEventListener("input", debouncedAddAddress);
pin.addEventListener("input", debouncedAddAddress);
phone.addEventListener("input", debouncedAddAddress);

addAddressSubmitBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  let validated = true;
  if (!nameRegex.test(fName.value.trim())) {
    fNameError.innerHTML = "Name can only contain letters A - Z";
    validated = false;
  }
  if (!nameRegex.test(lName.value.trim())) {
    lNameError.innerHTML = "Name can only contain letters A - Z";
    validated = false;
  }
  if (!nameRegex.test(state.value.trim()) || state.value.trim().length < 3) {
    stateError.innerHTML = "Please enter a valid state";
    validated = false;
  }
  if (!addressRegex.test(streetAddress.value.trim())) {
    streetAddressError.innerHTML = "Please enter a valid street address";
    validated = false;
  } else if (streetAddress.value.trim().length < 10) {
    streetAddressError.innerHTML = "Address is too short";
    validated = false;
  }
  if (!nameRegex.test(city.value.trim()) || city.value.trim().length < 3) {
    cityError.innerHTML = "Please enter a valid city/town";
    validated = false;
  }
  if (!pinRegex.test(pin.value.trim())) {
    pinError.innerHTML = "PIN Code should contain 6 numbers";
    validated = false;
  }
  if (!validatePhoneNumber(phone.value.trim())) {
    phoneError.innerHTML = "Enter a valid phone number with country code";
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
          firstName: fName.value.trim(),
          lastName: lName.value.trim(),
          state: state.value.trim(),
          streetAddress: streetAddress.value.trim(),
          city: city.value.trim(),
          pinCode: pin.value.trim(),
          phone: phone.value.trim(),
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

const placeOrderBtn = document.getElementById("place-order-btn");
const selectAddressError = document.getElementById("select-address-error");
const selectPaymentError = document.getElementById("select-payment-error");

placeOrderBtn.addEventListener("click", async () => {
  const addressContainer = document.getElementById("address-container");
  const selectedAddress = [
    ...addressContainer.querySelectorAll('input[type="radio"'),
  ].filter((radio) => radio.checked);
  const paymentContainer = document.getElementById("payment-container");
  const selectedPayment = [
    ...paymentContainer.querySelectorAll('input[type="radio"'),
  ].filter((radio) => radio.checked);
  let validated = true;

  if (selectedAddress[0] == undefined) {
    selectAddressError.innerHTML = "* Please select an address";
    scrollTo(0, 0);
    validated = false;
  } else {
    selectAddressError.innerHTML = "";
  }

  if (selectedPayment[0] == undefined) {
    selectPaymentError.innerHTML = "* Please select a payment method";
    validated = false;
  } else {
    selectPaymentError.innerHTML = "";
  }
  const couponCode = document.getElementById("coupon-code").value.trim();
  if (couponCode.length != 0) {
    body.couponCode = couponCode;
  }

  if (validated) {
    const body = {
      addressId: selectedAddress[0].getAttribute("data-address-id"),
      paymentMethod: selectedPayment[0].id,
    };
    const cartId = placeOrderBtn.getAttribute("data-cart-id");
    if (cartId) {
      body.orderType = "cart order";
      body.cartId = cartId;
    } else {
      const productId = placeOrderBtn.getAttribute("data-product-id");
      body.orderType = "product order";
      body.productId = productId;
    }
    if (
      body.paymentMethod == "payment_cod" ||
      body.paymentMethod == "payment_wallet"
    ) {
      const response = await fetch(`/place-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Your Order has been successfully placed",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        }).then(async (result) => {
          const data = await response.json();
          const orderResponse = await fetch(`/track-order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: data.id,
              payment: "success",
            }),
          });

          if (orderResponse.redirected) {
            window.location.href = orderResponse.url;
          }
        });
      } else if (response.status == 400) {
        const data = await response.json();
        Toastify({
          text: data.message,
          className: "danger",
          gravity: "top",
          position: "center",
          style: {
            background: "red",
          },
        }).showToast();
      } else if (response.status == 402) {
        const data = await response.json();
        Swal.fire({
          title: "Failed!",
          text: data.message,
          icon: "error",
          timer: 3000,
          showConfirmButton: false,
        });
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
    } else if (body.paymentMethod == "payment_razorpay") {
      const response = await fetch("/fetch-amount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderType: body.orderType,
          productId: body.orderType == "product order" ? body.productId : "",
        }),
      });
      if (response.ok) {
        const data = await response.json();

        try {
          const response = await fetch(`/place-order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (response.ok) {
            let totalCharge = data.totalCharge.toFixed(2);
            totalCharge = totalCharge.replace(".", "");
            const orderData = await response.json();

            var options = {
              key: "rzp_test_qqwGsGvbKk4gap",
              amount: parseInt(totalCharge),
              currency: "INR",
              name: "ZEITKRAFT WATCHES",
              order_id: data.orderId,
              callback_url: "https://eneqd3r9zrjok.x.pipedream.net/",
              notes: {
                address: "Razorpay Corporate Office",
              },
              theme: {
                color: "#132451",
              },
              handler: function (response) {
                handlePaymentResponse(response, orderData);
              },
              modal: {
                ondismiss: function () {
                  handlePaymentFailure(orderData);
                },
              },
            };
            var rzp1 = new Razorpay(options);
            rzp1.open();
          } else if (response.status == 400) {
            const data = await response.json();
            Toastify({
              text: data.message,
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
        } catch (err) {
          console.log(err);
        }

        const handlePaymentResponse = async (paymentResponse, data) => {
          try {
            if (paymentResponse) {
              Swal.fire({
                title: "Success!",
                text: "Your Order has been successfully placed",
                icon: "success",
                timer: 3000,
                showConfirmButton: false,
              }).then(async (result) => {
                console.log(data);
                const orderResponse = await fetch(`/track-order`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    orderId: data.id,
                    payment: "success",
                  }),
                });

                if (orderResponse.redirected) {
                  window.location.href = orderResponse.url;
                }
              });
            } else {
              Toastify({
                text: "Payment Failed",
                className: "danger",
                gravity: "top",
                position: "center",
                style: {
                  background: "red",
                },
              }).showToast();
            }
          } catch (error) {
            console.error("Error:", error);
            Toastify({
              text: "Payment processing error",
              className: "danger",
              gravity: "top",
              position: "center",
              style: {
                background: "red",
              },
            }).showToast();
          }
        };
        const handlePaymentFailure = async (data) => {
          try {
            Swal.fire({
              title: "Failed!",
              text: "Payment Failed",
              icon: "error",
              timer: 3000,
              showConfirmButton: false,
            }).then(async (result) => {
              const orderResponse = await fetch(`/track-order`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: data.id,
                  payment: "failed",
                }),
              });

              if (orderResponse.redirected) {
                window.location.href = orderResponse.url;
              }
            });
          } catch (err) {
            console.log(err);
          }
        };
      } else if (response.status == 400) {
        const data = await response.json();
        Toastify({
          text: data.message,
          className: "danger",
          gravity: "top",
          position: "center",
          style: {
            background: "red",
          },
        }).showToast();
      }
    }
  }
});

const couponCode = document.getElementById("coupon-form");
document.getElementById("coupon-warning").style.display = "none";
couponCode.addEventListener("submit", async (event) => {
  event.preventDefault();

  const couponCodeElem = document.getElementById("coupon-code");
  const couponCode = document.getElementById("coupon-code").value.trim();
  const couponError = document.getElementById("coupon-error");
  const codeRegex = /^[a-zA-Z0-9]+$/;

  if (couponCode.length < 3 || !codeRegex.test(couponCode)) {
    couponError.innerHTML = "Please Enter a valid coupon code";
  } else {
    couponError.innerHTML = "";
    const response = await fetch("/apply-coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        couponCode: couponCode,
      }),
    });
    if (response.ok) {
      document.getElementById("coupon-warning").style.display = "inline";
      const data = await response.json();
      const totalAmount = Number(
        document.getElementById("total-amount").getAttribute("data-total")
      );
      let validated = true;
      if (totalAmount < data.minAmount) {
        couponError.innerHTML = `This coupon can only be applied for purchase over ₹${data.minAmount.toLocaleString()}`;
        couponCodeElem.value = "";
        validated = false;
      } else {
        couponError.innerHTML = "";
      }
      if ((totalAmount * data.offerPercent) / 100 > data.maxAmount) {
        couponError.innerHTML = `Only ₹${data.maxAmount} can be redeemed using this coupon`;
        couponCodeElem.value = "";
        validated = false;
      } else {
        couponError.innerHTML = "";
      }
      if (validated) {
        const totalAmountList = document.getElementById("total-list");
        const priceList = totalAmountList.parentNode;
        priceList.removeChild(totalAmountList);
        const discount = document.createElement("li");
        discount.innerHTML = `<li>Discount <span>&#x20b9; ${(
          (totalAmount * Number(data.offerPercent)) /
          100
        ).toLocaleString()}</span></li>`;
        const total = document.createElement("li");
        total.innerHTML = `<li class="font-weight-bold">Total <span class="font-weight-bold">&#x20b9; ${
          (
            totalAmount -
            totalAmount * Number(data.offerPercent) / 100
          ).toLocaleString()
        }</span></li>`;
        priceList.appendChild(discount);
        priceList.appendChild(total);
      }
    } else if (response.status == 400) {
      couponError.innerHTML = "Please Enter a valid coupon code";
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
