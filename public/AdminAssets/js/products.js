const listProduct = async (productId, body) => {
    try{
        Swal.fire({
            background: '#000',
            title: body.listed ? 'Are you sure you want to list this Product?' : 'Are you sure you want to unlist this Product?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: body.listed ? 'Yes, list it!' : 'Yes, unlist it!'
          }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetch(`/admin/list-product?productId=${productId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body) 
                })
        
                if(response.ok){
                    localStorage.setItem('toastMessage', body.listed ? 'Product listed successfully' : 'Product unlisted successfully');
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
    catch (err) {
        console.log(err.message);
    }
}


document.addEventListener('DOMContentLoaded', () => {
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


  const table = document.getElementById('table');
  table.addEventListener('click', async (event) => {
      if(event.target.classList.contains('delete-btn')){
          const productId = event.target.getAttribute('data-product-id');

          Swal.fire({
            background: '#000',
            title: 'Are you sure you want to delete this Product?',
            text: 'There is no reverting this action',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
          }).then(async (result) => {
            if (result.isConfirmed) {
              const response = await fetch(`/admin/delete-product?productId=${productId}`, {
                method: 'DELETE',
              })
    
              if(response.ok){
                localStorage.setItem('toastMessage', 'Product deleted successfully');
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
      if(event.target.classList.contains('list-btn')){
          const productId = event.target.getAttribute('data-product-id');
          const body = {
              listed: true,
          }

        listProduct(productId, body);
      }
      else if (event.target.classList.contains('unlist-btn')){
        const productId = event.target.getAttribute('data-product-id');
          const body = {
              listed: false,
          }
          
        listProduct(productId, body);
  
      }
      if(event.target.classList.contains('edit-btn')){
          const productId = event.target.getAttribute('data-product-id');
          window.location.href = `/admin/edit-product?productId=${productId}`;
      }
      
  })
})

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
        window.location.href = `/admin/products?${params.toString()}`;
      } else {
        window.location.href = `/admin/products${search}&page=${page}`;
      }
    } else {
      window.location.href = `/admin/products?page=${page}`;
    }
  }
});
