const parentDiv = document.getElementById("parent-div");

parentDiv.addEventListener("click", async (event) => {
  if (event.target.classList.contains("add-to-cart")) {
    event.preventDefault();
    const productId = event.target.getAttribute("data-product-id");

    const response = await fetch(`/add-to-cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: productId,
        quantity: 1,
      }),
    });
    if (response.status == 201) {
      Toastify({
        text: "Product added to cart",
        className: "success",
        gravity: "top",
        position: "center",
        style: {
          background: "#132451",
        },
      }).showToast();
    } else if (response.status == 200) {
      window.location.href = "/login";
    } else if (response.status == 400){
        Toastify({
            text: "Product already added to the cart",
            className: "success",
            gravity: "top",
            position: "center",
            style: {
              background: "#132451",
            },
          }).showToast();
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
  }
});
