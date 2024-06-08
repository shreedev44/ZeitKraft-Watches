document.addEventListener("DOMContentLoaded", () => {
  const toastMessage = window.localStorage.getItem("toastMessage");
  if(toastMessage){
    Toastify({
      text: toastMessage,
      className: "success",
      gravity: "top",
      position: "center",
      style: {
        background: "#132451",
      },
    }).showToast();
    window.localStorage.removeItem("toastMessage");
  }
})

const productsWholeDiv = document.getElementById("products-whole-div");

productsWholeDiv.addEventListener("click", async (event) => {
  if (event.target.id == "cancel-btn") {
    event.preventDefault();
    Swal.fire({
      title: "Please enter your reason for cancelling the order",
      input: "text",
      inputPlaceholder: "Reason",
      showCancelButton: true,
      confirmButtonText: "Submit",
      confirmButtonClass: "btn-navy py-2 px-3",
      cancelButtonText: "Cancel",
      cancelButtonClass: "btn-outline-navy py-1 px-2",
      inputValidator: (value) => {
        const regex = /^(?=.*[A-Za-z])[A-Za-z0-9\s]{0,}$/;
        if (!regex.test(value)) {
          return "The reason may only contain Letters and numbers. It should contain min 5 characters";
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const orderId = event.target.getAttribute("data-order-id");
        const productId = event.target.getAttribute("data-product-id");
        try {
          const response = await fetch(`/cancel-order`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: orderId,
              productId: productId,
              reason: result.value,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            if(data.message){
              window.localStorage.setItem("toastMessage", data.message);
            }
            Swal.fire({
              title: "Success!",
              text: "Your Order has been Cancelled",
              icon: "success",
              timer: 3000,
              showConfirmButton: false,
            }).then(() => {
              location.reload();
            });
          }
        } catch (err) {
          console.log(err);
        }
      }
    });
  } else if (event.target.id == "return-btn") {
    event.preventDefault();

    Swal.fire({
      title: "Please enter your reason for returning the order",
      input: "text",
      inputPlaceholder: "Reason",
      showCancelButton: true,
      confirmButtonText: "Submit",
      confirmButtonClass: "btn-navy py-2 px-3",
      cancelButtonText: "Cancel",
      cancelButtonClass: "btn-outline-navy py-1 px-2",
      inputValidator: (value) => {
        const regex = /^(?=.*[A-Za-z])[A-Za-z0-9\s]{0,}$/;
        if (!regex.test(value)) {
          return "The reason may only contain Letters and numbers. It cannot be empty";
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const orderId = event.target.getAttribute("data-order-id");
        const productId = event.target.getAttribute("data-product-id");
        try {
          const response = await fetch(`/request-order-return`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: orderId,
              productId: productId,
              reason: result.value,
            }),
          });
          if (response.ok) {
            Swal.fire({
              title: "Success!",
              text: "Requested for return successfully",
              icon: "success",
              timer: 3000,
              showConfirmButton: false,
            }).then(() => {
              location.reload();
            });
          }
        } catch (err) {
          console.log(err);
        }
      }
    });
  }
});

try {
  const payBtn = document.getElementById("pay-btn");
  payBtn.addEventListener("click", async (event) => {
    try {
      event.preventDefault();
      const orderId = payBtn.getAttribute("data-order-id");

      const response = await fetch("/fetch-amount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderType: "repay",
          orderId: orderId,
          productId: "",
        }),
      });
      if (response.ok) {
        const data = await response.json();
        let totalCharge = data.totalCharge.toFixed(2);
        totalCharge = totalCharge.replace(".", "");

        var options = {
          key: "rzp_test_qqwGsGvbKk4gap",
          amount: parseInt(totalCharge),
          currency: "INR",
          name: "ZEITKRAFT WATCHES",
          order_id: data.razorpayOrderId,
          callback_url: "https://eneqd3r9zrjok.x.pipedream.net/",
          notes: {
            address: "Razorpay Corporate Office",
          },
          theme: {
            color: "#132451",
          },
          handler: function (response) {
            handlePaymentResponse(response, data.orderId);
          },
          modal: {
            ondismiss: function () {
              handlePaymentFailure(data.orderId);
            },
          },
        };
        var rzp1 = new Razorpay(options);
        rzp1.open();

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
                    orderId: data,
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
              location.reload();
            });
          } catch (err) {
            console.log(err);
          }
        };
      }
      else if(response.status == 400){
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
    } catch (err) {
      console.log(err);
    }
  });
} catch (err) {
  console.log(err);
}
