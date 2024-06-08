const table = document.getElementById("table");

const changeStatus = async (orderId, productId, status, quantity) => {
  try {
    let body = {
      orderId: orderId,
      productId: productId,
      status: status,
    };
    if (quantity) {
      body.quantity = quantity;
    }
    const response = await fetch("/admin/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      Swal.fire({
        background: "#000",
        title: "Success!",
        text: `Order ${status}`,
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
};

table.addEventListener("click", (event) => {
  if (
    event.target.id == "shipped" ||
    event.target.id == "out-for-delivery" ||
    event.target.id == "delivered" ||
    event.target.id == "approve" ||
    event.target.id == "reject"
  ) {
    event.preventDefault();

    const orderId = event.target.getAttribute("data-order-id");
    const productId = event.target.getAttribute("data-product-id");
    let status = event.target.getAttribute("data-status");
    if (event.target.id == "approve") {
      let quantity = event.target.getAttribute("data-quantity");
      changeStatus(orderId, productId, status, quantity);
    } else {
      changeStatus(orderId, productId, status);
    }
  } else if (event.target.classList.contains("reason")) {
    event.preventDefault();
    const reason = event.target.getAttribute("data-reason");
    Swal.fire({
      background: "#000",
      title: "Reason",
      text: reason,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Close",
    });
  }
});
