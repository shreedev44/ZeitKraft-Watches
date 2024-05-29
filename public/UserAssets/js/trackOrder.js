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
