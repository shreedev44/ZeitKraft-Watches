const paginationList = document.getElementById("pagination-list");
paginationList.addEventListener("click", (event) => {
  if (event.target.classList.contains("pagination-link")) {
    event.preventDefault();
    const page = event.target.getAttribute("data-page");
    let search = window.location.search;
    if (search) {
      const params = new URLSearchParams(search);
      if (params.get("page")) {
        params.set("page", page);
        window.location.href = `/admin/orders?${params.toString()}`;
      } else {
        window.location.href = `/admin/orders${search}&page=${page}`;
      }
    } else {
      window.location.href = `/admin/orders?page=${page}`;
    }
  }
});