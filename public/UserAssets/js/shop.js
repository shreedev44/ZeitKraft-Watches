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
  const query = window.location.search.slice(1);
  const params = query.split("&");
  const queryParams = {};

  params.forEach((param) => {
    const [key, value] = param.split("=");
    queryParams[key] = value;
  });

  if (queryParams.search != null) {
    let search;
    if(queryParams.search.includes('%20')){
      search = queryParams.search.replace(/%20/g, ' ');
    }
    else{
      search = queryParams.search.split('+').join(' ');
    }
    document.getElementById("search-box").value = search
  }
  const filterResults = document.getElementById("filter-resuls");
  if(queryParams.category != undefined){
    if(queryParams.category != 'null'){
      const categories = queryParams.category.split('%20').join(' ')
      filterResults.innerHTML += `<span class="badge badge-dark mr-1">Category: ${categories}</span>`
    }
    if(queryParams.brand != 'null'){
      const brands = queryParams.brand.split('%20').join(' ')
      filterResults.innerHTML += `<span class="badge badge-dark mr-1">Brands: ${brands}</span>`
    }
    if(queryParams.type != 'null'){
      const types = queryParams.type.split('%20').join(' ')
      filterResults.innerHTML += `<span class="badge badge-dark mr-1">Types: ${types}</span>`
    }
    if(queryParams.dialColor != 'null'){
      const colors = queryParams.dialColor.split('%20').join(' ')
      filterResults.innerHTML += `<span class="badge badge-dark mr-1">Dial Color: ${colors}</span>`
    }
    if(queryParams.strapColor != 'null'){
      const colors = queryParams.strapColor.split('%20').join(' ')
      filterResults.innerHTML += `<span class="badge badge-dark mr-1">Strap Color: ${colors}</span>`
    }
  }
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

const sortDiv = document.getElementById("sort-pagination-div");
sortDiv.addEventListener("click", async (event) => {
  try {
    if (
      event.target.id == "price-asc" ||
      event.target.id == "price-desc" ||
      event.target.id == "name-asc" ||
      event.target.id == "name-desc" ||
      event.target.id == "default-desc" ||
      event.target.classList.contains("pagination") ||
      event.target.classList.contains("filter")
    ) {
      event.preventDefault();
      let category = null;
      let brand = null;
      let type = null;
      let dialColor = null;
      let strapColor = null;
      const query = window.location.search.slice(1);
      const params = query.split("&");
      const queryParams = {};
    
      params.forEach((param) => {
        const [key, value] = param.split("=");
        queryParams[key] = value;
      });
      if (event.target.classList.contains("filter")) {
        let filter = event.target.parentElement.parentElement.id;
        let value = event.target.innerHTML;
        switch (filter) {
          case "category":
            category = queryParams.category != 'null' && !(queryParams.category.includes(value)) ? queryParams.category + ',' +value: value;
            break;
          case "brand":
            brand = queryParams.brand != 'null' && !(queryParams.brand.includes(value)) ? queryParams.brand + ',' +value: value;
            break;
          case "type":
            type = queryParams.type != 'null' && !(queryParams.type.includes(value)) ? queryParams.type + ',' +value: value;
            break;
          case "dialColor":
            dialColor = queryParams.dialColor != 'null' && !(queryParams.dialColor.includes(value)) ? queryParams.dialColor + ',' +value: value;
            break;
          case "strapColor":
            strapColor = queryParams.strapColor != 'null' && !(queryParams.strapColor.includes(value)) ? queryParams.strapColor + ',' +value: value;
            break;
        }
      }
      
      const sort = document.getElementById("select").value;
      let order = event.target.id.split("-")[1];
      if (event.target.id) {
        window.localStorage.setItem("order", order);
      } else {
        order = window.localStorage.getItem("order");
      }
      const page = event.target.getAttribute("data-page");
      const search = document.getElementById("search-box").value;
      window.location.href = `/shop?sortBy=${sort ?? "addedDate"}&order=${
        order ?? "desc"
      }&productPage=${
        page ?? 1
      }&category=${category}&brand=${brand}&type=${type}&dialColor=${dialColor}&strapColor=${strapColor}&search=${search}`;
    }
  } catch (err) {
    console.log(err);
  }
});
