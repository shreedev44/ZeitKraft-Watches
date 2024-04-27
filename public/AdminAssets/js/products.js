const deleteProduct = async (productId, body) => {
    try{
        const response = await fetch(`/admin/delete-product?productId=${productId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body) 
        })

        if(response.ok){
            location.reload();
        }
        else{
            alert('Something went wrong while deleting the product');
        }
    }
    catch (err) {
        console.log(err.message);
    }
}



const table = document.getElementById('table');
table.addEventListener('click', async (event) => {
    if(event.target.classList.contains('delete-btn')){
        const productId = event.target.getAttribute('data-product-id');
        const body = {
            delete: true,
        }

        deleteProduct(productId, body);
    }
    if(event.target.classList.contains('restore-btn')){
        const productId = event.target.getAttribute('data-product-id');
        const body = {
            delete: false,
        }

        deleteProduct(productId, body);
    }
    if(event.target.classList.contains('edit-btn')){
        const productId = event.target.getAttribute('data-product-id');
        window.location.href = `/admin/edit-product?productId=${productId}`;
    }
    
})