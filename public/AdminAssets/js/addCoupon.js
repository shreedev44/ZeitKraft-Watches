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

        
    }
    catch(err){
        console.log(err);
    }
})
