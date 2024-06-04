document.addEventListener('DOMContentLoaded', () => {
  const toastMessage = window.localStorage.getItem('toastMessage');
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
    window.localStorage.removeItem('toastMessage')
  }
})



const parentDiv = document.getElementById("parent-div");

parentDiv.addEventListener("click", async (event) => {
  try {
    if (event.target.classList.contains("add-to-cart")) {
      event.preventDefault();
      const productId = event.target.getAttribute("data-product-id");
      const response = await fetch("/add-to-cart", {
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
      } else if (response.status == 400) {
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
    } else if (event.target.classList.contains("remove-from-wishlist")) {
      event.preventDefault();

      const productId = event.target.getAttribute("data-product-id");
      const response = await fetch("/remove-from-wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
        }),
      });
      if (response.redirected) {
        window.location.href = response.url;
      } else if (response.ok) {
        window.localStorage.setItem('toastMessage', 'Product removed from wishlist');
        location.reload()
      }
      else{
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
  } catch (err) {
    console.log(err);
  }
});
