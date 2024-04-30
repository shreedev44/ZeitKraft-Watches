document.addEventListener("DOMContentLoaded", function () {

  const toastMessage = localStorage.getItem("toastMessage");

  if (toastMessage) {
    Toastify({
      text: toastMessage,
      className: "success",
      gravity: 'top',
      position: 'center',
      style: {
        background: "#28a745",
      }
    }).showToast();

    localStorage.removeItem("toastMessage");
  }

  const categoryContainer = document.querySelector(".card-container");

  categoryContainer.addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-btn")) {
      event.preventDefault();

      const categoryId = event.target.getAttribute("data-category-id");
      window.location.href = `/admin/edit-category?categoryId=${categoryId}`;
    } else if (event.target.classList.contains("delete-btn")) {
      event.preventDefault();

      const categoryId = event.target.getAttribute("data-category-id");
      const response = await fetch(
        `/admin/delete-category?categoryId=${categoryId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        location.reload();
      } else {
        alert("Something went wrong");
      }
    } else if (event.target.classList.contains("restore-btn")) {
      event.preventDefault();

      const categoryId = event.target.getAttribute("data-category-id");
      const response = await fetch(
        `/admin/restore-category?categoryId=${categoryId}`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        location.reload();
      } else {
        alert("Something went wrong");
      }
    }
  });
});
