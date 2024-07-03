document.addEventListener("DOMContentLoaded", () => {
  const toastMessage = window.localStorage.getItem("toastMessage");
  if (toastMessage) {
    Toastify({
      text: toastMessage,
      className: "success",
      gravity: "top",
      position: "center",
      style: {
        background: "#28a745",
      },
    }).showToast();
    window.localStorage.removeItem("toastMessage");
  }
});
const wholeDiv = document.getElementById("whole-div");
wholeDiv.addEventListener("click", async (event) => {
  try {
    if (event.target.classList.contains("list-btn")) {
      event.preventDefault();

      let body = {
        couponId: event.target.getAttribute("data-coupon-id"),
      };
      if (event.target.value == "unlist") {
        body.action = false;
      } else if (event.target.value == "list") {
        body.action = true;
      }

      const response = await fetch("/admin/list-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        window.localStorage.setItem(
          "toastMessage",
          `Coupon ${body.action ? "listed" : "unlisted"} successfully`
        );
        location.reload();
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
  } catch (err) {
    console.log(err);
  }
});

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
        window.location.href = `/admin/coupons?${params.toString()}`;
      } else {
        window.location.href = `/admin/coupons${search}&page=${page}`;
      }
    } else {
      window.location.href = `/admin/coupons?page=${page}`;
    }
  }
});