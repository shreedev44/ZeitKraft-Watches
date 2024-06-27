document.addEventListener("DOMContentLoaded", function () {
  const toastMessage = localStorage.getItem("toastMessage");

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

    localStorage.removeItem("toastMessage");
  }

  const brandContainer = document.querySelector(".card-container");

  brandContainer.addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-btn")) {
      event.preventDefault();

      const brandId = event.target.getAttribute("data-brand-id");
      window.location.href = `/admin/edit-brand?brandId=${brandId}`;
    } else if (event.target.classList.contains("list-btn")) {
      const brandId = event.target.getAttribute("data-brand-id");
      let body = {};
      if (event.target.value == "unlist") {
        body.listed = false;
      } else {
        body.listed = true;
      }
      Swal.fire({
        background: "#000",
        title: body.listed
          ? "Are you sure you want to list this brand?"
          : "Are you sure you want to unlist this brand?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: body.listed ? "Yes, list it!" : "Yes, unlist it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await fetch(`/admin/list-brand?brandId=${brandId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (response.ok) {
            localStorage.setItem(
              "toastMessage",
              body.listed
                ? "Brand listed successfully"
                : "Brand unlisted successfully"
            );
            this.location.reload();
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
      });
    } else if (event.target.classList.contains("delete-btn")) {
      event.preventDefault();

      const brandId = event.target.getAttribute("data-brand-id");
      Swal.fire({
        background: "#000",
        title: "Are you sure you want to delete this brand?",
        text: "There is no reverting this action",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await fetch(
            `/admin/delete-brand?brandId=${brandId}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            localStorage.setItem("toastMessage", "Brand deleted successfully");
            this.location.reload();
          } else if (response.status == 400) {
            const message = await response.json();
            Toastify({
              text: message.error,
              className: "danger",
              gravity: "top",
              position: "center",
              style: {
                background: "red",
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
        }
      });
    }
  });
});
