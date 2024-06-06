// document.addEventListener("DOMContentLoaded", () => {
//   if (window.location.search.includes("price")) {
//     if (window.location.search.includes("asc")) {
//       document.getElementById("price-asc").setAttribute("selected", null);
//     } else {
//       document.getElementById("price-desc").setAttribute("selected", null);
//     }
//   } else if (window.location.search.includes("brand.brandName")) {
//     if (window.location.search.includes("asc")) {
//       document.getElementById("name-asc").setAttribute("selected", null);
//     } else {
//       document.getElementById("name-desc").setAttribute("selected", null);
//     }
//   } else {
//     document.getElementById("default-desc").setAttribute("selected", null);
//   }
//   const query = window.location.search.slice(1);
//   const params = query.split("&");
//   const queryParams = {};

//   params.forEach((param) => {
//     const [key, value] = param.split("=");
//     queryParams[key] = value;
//   });

//   if (queryParams.search != null) {
//     let search;
//     if(queryParams.search.includes('%20')){
//       search = queryParams.search.replace(/%20/g, ' ');
//     }
//     else{
//       search = queryParams.search.split('+').join(' ');
//     }
//     document.getElementById("search-box").value = search
//   }
//   const filterResults = document.getElementById("filter-resuls");
//   if(queryParams.category != undefined){
//     if(queryParams.category != 'null'){
//       const categories = queryParams.category.split('%20').join(' ')
//       filterResults.innerHTML += `<span class="badge badge-dark mr-1">Category: ${categories}</span>`
//     }
//     if(queryParams.brand != 'null'){
//       const brands = queryParams.brand.split('%20').join(' ')
//       filterResults.innerHTML += `<span class="badge badge-dark mr-1">Brands: ${brands}</span>`
//     }
//     if(queryParams.type != 'null'){
//       const types = queryParams.type.split('%20').join(' ')
//       filterResults.innerHTML += `<span class="badge badge-dark mr-1">Types: ${types}</span>`
//     }
//     if(queryParams.dialColor != 'null'){
//       const colors = queryParams.dialColor.split('%20').join(' ')
//       filterResults.innerHTML += `<span class="badge badge-dark mr-1">Dial Color: ${colors}</span>`
//     }
//     if(queryParams.strapColor != 'null'){
//       const colors = queryParams.strapColor.split('%20').join(' ')
//       filterResults.innerHTML += `<span class="badge badge-dark mr-1">Strap Color: ${colors}</span>`
//     }
//   }
// });

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

// const sortDiv = document.getElementById("sort-pagination-div");
// sortDiv.addEventListener("click", async (event) => {
//   try {
//     if (
//       event.target.id == "price-asc" ||
//       event.target.id == "price-desc" ||
//       event.target.id == "name-asc" ||
//       event.target.id == "name-desc" ||
//       event.target.id == "default-desc" ||
//       event.target.classList.contains("pagination")
//       // event.target.classList.contains("filter")
//     ) {
//       event.preventDefault();
//       const query = window.location.search.slice(1);
//       const params = query.split("&");
//       const queryParams = {};

//       params.forEach((param) => {
//         const [key, value] = param.split("=");
//         queryParams[key] = value;
//       });
//       if(queryParams.)

//       const sort = document.getElementById("select").value;
//       let order = event.target.id.split("-")[1];
//       if (event.target.id) {
//         window.localStorage.setItem("order", order);
//       } else {
//         order = window.localStorage.getItem("order");
//       }
//       const page = event.target.getAttribute("data-page");
//       const search = document.getElementById("search-box").value;
//       window.location.href = `/shop?sortBy=${sort ?? "addedDate"}&order=${
//         order ?? "desc"
//       }&productPage=${
//         page ?? 1
//       }&category=${category}&brand=${brand}&type=${type}&dialColor=${dialColor}&strapColor=${strapColor}&search=${search}`;
//     }
//   } catch (err) {
//     console.log(err);
//   }
// });
