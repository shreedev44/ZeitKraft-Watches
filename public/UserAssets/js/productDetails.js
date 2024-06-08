var options2 = {
  fillContainer: true,
  offset: { vertical: 0, horizontal: 10 },
  zoomPosition: "original",
};

const imgThumb1 = document.getElementById("img-thumbnail1");
const imgThumb2 = document.getElementById("img-thumbnail2");
const imgThumb3 = document.getElementById("img-thumbnail3");
const productImg = document.getElementById("product-img");

document.addEventListener("DOMContentLoaded", () => {
  const imagePath = imgThumb1.getAttribute("data-img-path");
  productImg.src = imagePath;
  new ImageZoom(document.getElementById("image-container1"), options2);
});

imgThumb1.addEventListener("click", () => {
  const imagePath = imgThumb1.getAttribute("data-img-path");
  productImg.src = imagePath;
  new ImageZoom(document.getElementById("image-container1"), options2);
});

imgThumb2.addEventListener("click", () => {
  const imagePath = imgThumb2.getAttribute("data-img-path");
  productImg.src = imagePath;
  new ImageZoom(document.getElementById("image-container1"), options2);
});

imgThumb3.addEventListener("click", () => {
  const imagePath = imgThumb3.getAttribute("data-img-path");
  productImg.src = imagePath;
  new ImageZoom(document.getElementById("image-container1"), options2);
});

new ImageZoom(document.getElementById("image-container1"), options2);

document.getElementById("product-img-div").addEventListener("click", () => {
  openModal(productImg.src);
});

document
  .getElementById("product-modal-close-btn")
  .addEventListener("click", () => {
    productModal.hide();
  });

const productModal = new bootstrap.Modal(
  document.getElementById("productModal")
);

const modalImg = document.getElementById("modalImg");

function openModal(imageSrc) {
  modalImg.src = imageSrc;
  productModal.show();
}

document
  .getElementById("productModal")
  .addEventListener("hidden.bs.modal", function () {});

const addToCartBtn = document.getElementById("add-to-cart");

addToCartBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const productId = addToCartBtn.getAttribute("data-product-id");
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
});

const wishlistBtn = document.getElementById("wishlist-btn");
wishlistBtn.addEventListener("click", async (event) => {
  try {
    event.preventDefault();

    const productId = wishlistBtn.getAttribute("data-product-id");
    const response = await fetch("/add-to-wishlist", {
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
      Toastify({
        text: "Product added to wishlist",
        className: "success",
        gravity: "top",
        position: "center",
        style: {
          background: "#132451",
        },
      }).showToast();
    } else if (response.status == 400) {
      Toastify({
        text: "Product already in wishlist",
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
  } catch (err) {
    console.log(err);
  }
});
