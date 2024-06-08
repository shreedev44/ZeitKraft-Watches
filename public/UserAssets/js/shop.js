
document.addEventListener("DOMContentLoaded", function () {
  const filterForm = document.getElementById("filterForm");
  const sortSelect = document.getElementById("sortSelect");
  const paginationLinks = document.querySelectorAll(".pagination");
  const searchForm = document.getElementById('search-box');

  // Apply existing filters and sorting to the filter form on load
  const urlParams = new URLSearchParams(window.location.search);

  // Set checked state of checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    if (urlParams.getAll(checkbox.name).includes(checkbox.value)) {
      checkbox.checked = true;
    }
  });

  // Set the sorting select value
  if (urlParams.has("sort")) {
    sortSelect.value = urlParams.get("sort");
  }

  // Set the price range values
  if (urlParams.has("minPrice")) {
    document.getElementById("minPrice").value = urlParams.get("minPrice");
  }
  if (urlParams.has("maxPrice")) {
    document.getElementById("maxPrice").value = urlParams.get("maxPrice");
  }
  if (urlParams.has("search")) {
    document.getElementById("search-box").value = urlParams
      .get("search")
      .split("+")
      .join(" ");
  }

  // Handle filter form submission
  filterForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(filterForm);
    const newParams = new URLSearchParams(formData);
    window.location.search = newParams.toString();
  });

  // Handle sorting change
  sortSelect.addEventListener("change", function () {
    urlParams.set("sort", sortSelect.value);
    window.location.search = urlParams.toString();
  });

  // Handle pagination click
  paginationLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      urlParams.set("page", link.getAttribute("data-page"));
      window.location.search = urlParams.toString();
    });
  });
});

const parentDiv = document.getElementById("parent-div");

parentDiv.addEventListener("click", async (event) => {
  try {
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
    } else if (event.target.classList.contains("add-to-wishlist")) {
      event.preventDefault();
      const productId = event.target.getAttribute("data-product-id");
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
    }
  } catch (err) {
    console.log(err);
  }
});
