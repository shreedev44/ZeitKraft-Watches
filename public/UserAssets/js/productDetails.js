
var options2 = {
    fillContainer: true,
    offset: {vertical: 0, horizontal: 10},
    zoomPosition: 'original'
};


const imgThumb1 = document.getElementById('img-thumbnail1');
const imgThumb2 = document.getElementById('img-thumbnail2');
const imgThumb3 = document.getElementById('img-thumbnail3');
const productImg = document.getElementById('product-img');



document.addEventListener('DOMContentLoaded', () => {
    const imagePath = imgThumb1.getAttribute('data-img-path');
    productImg.src = imagePath;
    new ImageZoom(document.getElementById("image-container1"), options2);
})

imgThumb1.addEventListener('click', () => {
    const imagePath = imgThumb1.getAttribute('data-img-path');
    productImg.src = imagePath;
    new ImageZoom(document.getElementById("image-container1"), options2);
})

imgThumb2.addEventListener('click', () => {
    const imagePath = imgThumb2.getAttribute('data-img-path');
    productImg.src = imagePath;
    new ImageZoom(document.getElementById("image-container1"), options2);
})

imgThumb3.addEventListener('click', () => {
    const imagePath = imgThumb3.getAttribute('data-img-path');
    productImg.src = imagePath;
    new ImageZoom(document.getElementById("image-container1"), options2);
})



new ImageZoom(document.getElementById("image-container1"), options2);


document.getElementById('product-img-div').addEventListener('click', () => {
    openModal(productImg.src)
})

document.getElementById('product-modal-close-btn').addEventListener('click', () => {
    productModal.hide();
})


// Get the modal
const productModal = new bootstrap.Modal(document.getElementById('productModal'));

// Get the image and insert it inside the modal
const modalImg = document.getElementById('modalImg');

// Function to open the modal with the image source
function openModal(imageSrc) {
  modalImg.src = imageSrc;
  productModal.show();
}

// Close the modal when the user clicks the close button
document.getElementById('productModal').addEventListener('hidden.bs.modal', function () {
  modalImg.src = ''; // Clear the image source when the modal is closed
});
