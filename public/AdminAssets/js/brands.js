
document.addEventListener("DOMContentLoaded", function(
) {

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

  const brandContainer = document.querySelector(".card-container");

  brandContainer.addEventListener("click", async(event) => {
    if (event.target.classList.contains("edit-btn")) {
      event.preventDefault();

      const brandId = event.target.getAttribute('data-brand-id');
      window.location.href = `/admin/edit-brand?brandId=${brandId}`
}
    else if (event.target.classList.contains("delete-btn")) {
      event.preventDefault();

      const brandId = event.target.getAttribute('data-brand-id');
      const response = await fetch(`/admin/delete-brand?brandId=${brandId}`, {
        method: 'DELETE'
});

      if(response.ok){
        location.reload();
      }
      else{
        alert('Something went wrong');
      }
    }
    else if (event.target.classList.contains("restore-btn")) {
      event.preventDefault();

      const brandId = event.target.getAttribute('data-brand-id');
      const response = await fetch(`/admin/restore-brand?brandId=${brandId}`, {
        method: 'PATCH'
});

      if(response.ok){
        location.reload();
      }
      else{
        alert('Something went wrong');
      }
    }
  });
});
