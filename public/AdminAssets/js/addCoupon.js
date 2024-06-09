const couponForm = document.getElementById("coupon-form");

couponForm.addEventListener("submit", async (event) => {
    try{
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

        if(!codeRegex.test(couponCode.value)){
            submitError.innerHTML = "Please enter a valid code(only letters A-Z and numbers)";
            couponCodeError.display = "inline";
            validated = false;
        }
        else{
            couponCodeError.display = 'none';
        }
        if(!offerRegex.test(offer.value)){
            submitError.innerHTML = "Please enter a valid offer percent(1 - 99)";
            offerError.display = 'inline';
            validated = false;
        }
        else{
            offerError.display = 'none';
        }
        if(!minPriceRegex.test(minPurchase.value)){
            submitError.innerHTML = "Please enter a valid minimum price(5000 - 40000)";
            minPurchaseError.display = 'inline';
            validated = false;
        }
        else{
            minPurchaseError.display = 'none';
        }
        if(!redeemAmountRegex.test(redeemAmount.value)){
            submitError.innerHTML = "Please enter a valid maximum redeem price(5000 - 40000)";
            redeemAmountError.display = 'inline';
            validated = false;
        }
        else{
            redeemAmountError.display = 'none';
        }
        const today = new Date();
        let expiry = new Date(expiryDate.value)
        if(expiry <= today){
            submitError.innerHTML = "Expiry date must be future date";
            expiryDateError.display = 'inline';
            validated = false;
        }
        else{
            expiryDateError.display = 'none';
        }

        if(validated){
            submitError.innerHTML = '';
            const response = await fetch("/admin/add-coupon", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    couponCode: couponCode.value,
                    offerPercent: offer.value,
                    minPurchase: minPurchase.value,
                    maxRedeem: redeemAmount.value,
                    expiryDate: expiry
                })
            });
            if(response.ok){
                window.localStorage.setItem("toastMessage", "Coupon added successfully");
                window.location.href = '/admin/coupons';
            }
            else{
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
    }
    catch(err){
        console.log(err);
    }
})
