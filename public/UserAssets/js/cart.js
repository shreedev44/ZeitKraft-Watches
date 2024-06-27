function initializeQuantityButtons() {
  var proQty2 = $(".pro-qty-2");
  proQty2.prepend('<span class="fa fa-angle-left dec qtybtn"></span>');
  proQty2.append('<span class="fa fa-angle-right inc qtybtn"></span>');
  proQty2.on("click", ".qtybtn", async function () {
    var $button = $(this);
    var oldValue = $button.parent().find("input").val();
    var $parent = $button.closest(".pro-qty-2");
    var productId = $parent.data("product-id");
    if ($button.hasClass("inc")) {
      if (oldValue < 5) {
        var newVal = parseFloat(oldValue) + 1;
        const quantity = await updateQuantity(productId, newVal);
        if (quantity == 0) {
          removeFromCart(productId);
        } else {
          newVal = quantity;
        }
      } else {
        newVal = 5;
      }
    } else {
      if (oldValue > 1) {
        var newVal = parseFloat(oldValue) - 1;
        const quantity = await updateQuantity(productId, newVal);
        if (quantity == 0) {
          removeFromCart(productId);
        } else {
          newVal = quantity;
        }
      } else {
        newVal = 1;
      }
    }
    $button.parent().find("input").val(newVal);
  });
}

const removeFromCart = async (productId) => {
  try {
    const response = await fetch(`/remove-from-cart?productId=${productId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      $("#cart-whole-div").load(
        location.href + " #cart-whole-div",
        function () {
          initializeQuantityButtons();
          handleRemoveProduct();
        }
      );
      Toastify({
        text: "Product removed from cart",
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
          background: "red",
        },
      }).showToast();
    }
  } catch (err) {
    console.log(err);
  }
};

function handleRemoveProduct() {
  const table = document.getElementById("table");
  table.addEventListener("click", async (event) => {
    if (event.target.classList.contains("remove-product")) {
      event.preventDefault();
      const productId = event.target.getAttribute("data-product-id");
      Swal.fire({
        background: "#fff",
        title: "Do you want to remove this product from the cart?",
        showCancelButton: true,
        cancelButtonClass: "btn-outline-navy py-1 px-2",
        confirmButtonText: "Yes, remove it!",
        confirmButtonClass: "btn-navy py-2 px-3",
      }).then(async (result) => {
        if (result.isConfirmed) {
          removeFromCart(productId);
        }
      });
    }
  });
}

async function updateQuantity(productId, quantity) {
  const response = await fetch(`/update-quantity`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: productId,
      quantity: quantity,
    }),
  });
  if (response.ok) {
    $("#cart-div").load(location.href + " #cart-div", function () {
      initializeQuantityButtons();
      handleRemoveProduct();
    });
    const { quantity } = await response.json();
    return quantity;
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

initializeQuantityButtons();
handleRemoveProduct();
