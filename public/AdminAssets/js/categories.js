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
    } else if (event.target.classList.contains('list-btn')) {
      const categoryId = event.target.getAttribute('data-category-id');
      let body = {};
      if(event.target.value == 'unlist'){
        body.listed = false;
      }
      else{
        body.listed = true;
      }
      Swal.fire({
        background: '#000',
        title: body.listed ? 'Are you sure you want to list this category?' : 'Are you sure you want to unlist this category?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: body.listed ? 'Yes, list it!' : 'Yes, unlist it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await fetch(`/admin/list-category?categoryId=${categoryId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })

          if(response.ok){
            localStorage.setItem('toastMessage', body.listed ? 'Category listed successfully' : 'Category unlisted successfully');
            this.location.reload();
          }
          else{
            Toastify({
              text: "Internal server error",
              className: "danger",
              gravity: 'top',
              position: 'center',
              style: {
                background: "red",
              }
            }).showToast();
          }
        }
      })
      
    } else if (event.target.classList.contains("delete-btn")) {
      event.preventDefault();

      const categoryId = event.target.getAttribute("data-category-id");
      Swal.fire({
        background: '#000',
        title: 'Are you sure you want to delete this category?',
        text: 'There is no reverting this action',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await fetch(`/admin/delete-category?categoryId=${categoryId}`, {
            method: 'DELETE',
          })

          if(response.ok){
            localStorage.setItem('toastMessage', 'Category deleted successfully');
            this.location.reload();
          }
          else{
            Toastify({
              text: "Internal server error",
              className: "danger",
              gravity: 'top',
              position: 'center',
              style: {
                background: "red",
              }
            }).showToast();
          }
        }
      })
    }
  });
});
