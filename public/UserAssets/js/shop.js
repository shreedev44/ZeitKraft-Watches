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
  }
});

const sortDiv = document.getElementById("sort-pagination-div");
sortDiv.addEventListener("click", async (event) => {
  try {
    const categoryFilter = document.getElementById("category-filter")
    if (
      event.target.id == "price-asc" ||
      event.target.id == "price-desc" ||
      event.target.id == "name-asc" ||
      event.target.id == "name-desc" ||
      event.target.id == "default-desc" ||
      event.target.classList.contains("pagination") || 
      categoryFilter.contains(event.target)
    ) {
      event.preventDefault();
      console.log(event.target)
      const sort = document.getElementById("select").value;
      const order = event.target.id.split("-")[1];
      const page = event.target.getAttribute("data-page");
      const search = document.getElementById('search-box').value
      window.location.href = `/shop?sortBy=${sort ?? "addedDate"}&order=${
        order ?? "desc"
      }&productPage=${page}&search=${search}`;
    }
  } catch (err) {
    console.log(err);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.search.includes("price")) {
    if (window.location.search.includes("asc")) {
      document.getElementById("price-asc").setAttribute("selected", null);
    } else {
      document.getElementById("price-desc").setAttribute("selected", null);
    }
  } else if (window.location.search.includes("brand.brandName")) {
    if (window.location.search.includes("asc")) {
      document.getElementById("name-asc").setAttribute("selected", null);
    } else {
      document.getElementById("name-desc").setAttribute("selected", null);
    }
  } else {
    document.getElementById("default-desc").setAttribute("selected", null);
  }

  if (window.location.search.includes("search")) {
    let search = window.location.search
      .slice(window.location.search.indexOf("search"))
      .split("=")[1];
      search = search.split('+').join(' ');
    document.getElementById("search-box").value = search;
  }
});
