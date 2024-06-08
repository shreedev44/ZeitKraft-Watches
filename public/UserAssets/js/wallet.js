const addMoneyBtn = document.getElementById("add-money-btn");

addMoneyBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const { value: amount } = await Swal.fire({
    title: "Enter Amount to Add",
    input: "number",
    inputLabel: "Amount (between 1000 and 50000)",
    inputPlaceholder: "Enter an amount",
    inputAttributes: {
      min: 1000,
      max: 50000,
      step: 1,
    },
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "You need to enter an amount!";
      }
      if (isNaN(value)) {
        return "Amount must be a number!";
      }
      if (value <= 0) {
        return "Amount cannot be zero!";
      }
      if (value < 1000 || value > 50000) {
        return "Amount must be between 1000 and 50000!";
      }
    },
  });
  if (amount) {
    const orderResponse = await fetch("/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
      }),
    });
    if (orderResponse.ok) {
      const orderData = await orderResponse.json();
      console.log(orderData)
      let addAmount = Number(orderData.amount).toFixed(2);
      addAmount = addAmount.replace(".", "");

      var options = {
        key: "rzp_test_qqwGsGvbKk4gap",
        amount: parseInt(addAmount),
        currency: "INR",
        name: "ZEITKRAFT WATCHES",
        order_id: orderData.orderId,
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

      const handlePaymentResponse = async (response) => {
        try {
          if (response) {
            const balanceResponse = await fetch("/add-money", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                amount: orderData.amount,
              }),
            });
            if (balanceResponse.ok) {
              Swal.fire({
                title: "Success!",
                text: `₹ ${amount} has been successfully credited to Wallet`,
                icon: "success",
                timer: 3000,
                showConfirmButton: false,
              }).then(async (result) => {
                location.reload();
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
          } else {
            Swal.fire({
              title: "Failed!",
              text: "Payment Failed",
              icon: "error",
              timer: 3000,
              showConfirmButton: false,
            }).then(async (result) => {
              location.reload;
            });
          }
        } catch (err) {
          console.log(err);
        }
      };
      const handlePaymentFailure = async () => {
        try {
          Swal.fire({
            title: "Failed!",
            text: "Payment Failed",
            icon: "error",
            timer: 3000,
            showConfirmButton: false,
          }).then(async (result) => {
            location.reload();
          });
        } catch (err) {
          console.log(err);
        }
      };
    }
  }
});
