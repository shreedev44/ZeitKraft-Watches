const couponForm = document.getElementById("coupon-form");
couponForm.addEventListener("submit", async (event) => {
  try {
    event.preventDefault();

    const couponCode = document.getElementById("coupon-code");
    const couponCodeError = document.getElementById("coupon-code-label");
    const offer = document.getElementById("offer");
    const offerError = document.getElementById("offer-label");
    const minPurchase = document.getElementById("min-purchase");
    const minPurchaseError = document.getElementById("min-purchase-label");
    const redeemAmount = document.getElementById("redeem-amount");
    const redeemAmountError = document.getElementById("redeem-amount-label");
    const expiryDate = document.getElementById("expiry");
    const expiryDateError = document.getElementById("expiry-label");
    const submitError = document.getElementById("submit-error");

    const codeRegex = /^[a-zA-Z0-9]+$/;
    const offerRegex = /^(?:[1-9][0-9]?|99)$/;
    const minPriceRegex = /^(?:[5-9]\d{3}|[1-3]\d{4}|40000)$/;
    const redeemAmountRegex = /^(?:[1-9]\d{3}|[1-4]\d{4}|50000)$/;
    let validated = true;

    if (!codeRegex.test(couponCode.value)) {
      submitError.innerHTML =
        "Please enter a valid code(only letters A-Z and numbers)";
      couponCodeError.innerHTML = "*";
      validated = false;
    } else {
      couponCodeError.innerHTML = "";
    }
    if (!offerRegex.test(offer.value)) {
      submitError.innerHTML = "Please enter a valid offer percent(1 - 99)";
      offerError.innerHTML = "*";
      validated = false;
    } else {
      offerError.innerHTML = "";
    }
    if (!minPriceRegex.test(minPurchase.value)) {
      submitError.innerHTML =
        "Please enter a valid minimum price(5000 - 40000)";
      minPurchaseError.innerHTML = "*";
      validated = false;
    } else {
      minPurchaseError.innerHTML = "";
    }
    if (!redeemAmountRegex.test(redeemAmount.value)) {
      submitError.innerHTML =
        "Please enter a valid maximum redeem price(1000 - 50000)";
      redeemAmountError.innerHTML = "*";
      validated = false;
    } else {
      redeemAmountError.innerHTML = "";
    }
    const today = new Date();
    let expiry = new Date(expiryDate.value);
    if (expiry <= today) {
      submitError.innerHTML = "Expiry date must be future date";
      expiryDateError.innerHTML = "*";
      validated = false;
    } else {
      expiryDateError.innerHTML = "";
    }

    if (validated) {
      submitError.innerHTML = "";
      const response = await fetch("/admin/add-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: couponCode.value,
          offerPercent: offer.value,
          minPurchase: minPurchase.value,
          maxRedeem: redeemAmount.value,
          expiryDate: expiry,
        }),
      });
      if (response.ok) {
        window.localStorage.setItem(
          "toastMessage",
          "Coupon added successfully"
        );
        window.location.href = "/admin/coupons";
      } else if (response.status == 400) {
        const data = await response.json();
        submitError.innerHTML = data.message;
        couponCodeError.innerHTML = "*";
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
  } catch (err) {
    console.log(err);
  }
});

document.getElementById("cancel-btn").addEventListener("click", () => {
  window.location.href = "/admin/coupons";
});
