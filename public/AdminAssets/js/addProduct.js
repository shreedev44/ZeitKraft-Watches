document.getElementById("cancel-btn").addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "/admin/products";
});

const productForm = document.getElementById("product-form");
const name = document.getElementById("name");
const model = document.getElementById("model");
const stock = document.getElementById("stock");
const price = document.getElementById("price");
const description = document.getElementById("description");
const dialColor = document.getElementById("dial-color");
const strapColor = document.getElementById("strap-color");
const fileInput1 = document.getElementById("upload-file1");
const fileInput2 = document.getElementById("upload-file2");
const fileInput3 = document.getElementById("upload-file3");
const uploadError = document.getElementById("upload-error");
const addBtn = document.getElementById("add-btn");
const cancelBtn = document.getElementById("cancel-btn");
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
let cropper = null;

const cropImage = (target, fileInput) => {
  const elementId = target.id;
  if (!fileInput.files[0]) {
    uploadError.innerHTML = "Please select a file to upload";
  } else {
    const file = fileInput.files[0];
    const fileType = file.type;
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.has(fileExtension) || !fileType.includes("image/")) {
      uploadError.innerHTML =
        "Please select a valid image file (JPG, JPEG, PNG, or WEBP).";
      target.value = "";
      return;
    } else {
      if (file && file.size > 5 * 1024 * 1024) {
        uploadError.innerHTML = "File is too large. The file size limit is 1MB";
        target.value = "";
        return;
      }

      const cropField = document.getElementById("crop-field");
      const cropBtn = document.createElement("button");
      cropBtn.classList.add("btn", "btn-primary", "m-3");
      cropBtn.textContent = "Crop";
      cropBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        uploadError.innerHTML = "";
        if (cropper) {
          try {
            async function dataURLtoFile(dataURL, fileName) {
              const response = await fetch(dataURL);
              const blob = await response.blob();

              const mimeType = "image/" + fileExtension;
              const file = new File([blob], fileName, { type: mimeType });

              return file;
            }

            const croppedCanvas = cropper.getCroppedCanvas();
            const croppedImageDataURL = croppedCanvas.toDataURL();

            const newFile = await dataURLtoFile(croppedImageDataURL, file.name);

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(newFile);

            target.dispatchEvent(
              new ClipboardEvent("change", {
                bubbles: true,
                cancelable: false,
              })
            );
            target.files = dataTransfer.files;

            setTimeout(() => {
              cropper.destroy();
              cropField.innerHTML = "";
              cropBtn.classList.add("d-none");
              addBtn.classList.remove("d-none");
              cancelBtn.classList.remove("d-none");
              if (elementId == "upload-file1") {
                document.getElementById("image-output1").src =
                  croppedImageDataURL;
              } else if (elementId == "upload-file2") {
                document.getElementById("image-output2").src =
                  croppedImageDataURL;
              } else if (elementId == "upload-file3") {
                document.getElementById("image-output3").src =
                  croppedImageDataURL;
              } else {
                console.log(event.target);
              }
            }, 100);
          } catch (err) {
            console.log(err.message);
          }
        } else {
          console.log("cropper not found");
        }
      });

      const image = new Image();
      image.src = window.URL.createObjectURL(file);

      image.addEventListener("load", () => {
        cropField.innerHTML = "";
        image.classList.add("img-fluid", "w-50");
        cropField.appendChild(image);
        cropField.appendChild(cropBtn);

        cropper = new Cropper(image, {
          aspectRatio: 1 / 1,
          cropBoxMovable: true,
          cropBoxResizable: true,
          dragMode: "move",
        });
      });
    }
  }
};

let categoryId, brandId;

document.addEventListener("DOMContentLoaded", function () {
  const selectBrand = document.getElementById("brand");
  const selectCategory = document.getElementById("category");

  const selectedBrandOption = selectBrand.options[selectBrand.selectedIndex];
  const selectedCategoryOption =
    selectCategory.options[selectCategory.selectedIndex];

  brandId = selectedBrandOption.getAttribute("data-brand-id");
  categoryId = selectedCategoryOption.getAttribute("data-category-id");

  selectBrand.addEventListener("change", () => {
    const selectedOption = selectBrand.options[selectBrand.selectedIndex];
    brandId = selectedOption.getAttribute("data-brand-id");
  });
  selectCategory.addEventListener("change", () => {
    const selectedOption = selectCategory.options[selectCategory.selectedIndex];
    categoryId = selectedOption.getAttribute("data-category-id");
  });
});

fileInput1.addEventListener("change", (event) => {
  const target = event.target;
  cropImage(target, fileInput1);
});
fileInput2.addEventListener("change", (event) => {
  const target = event.target;
  cropImage(target, fileInput2);
});
fileInput3.addEventListener("change", (event) => {
  const target = event.target;
  cropImage(target, fileInput3);
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nameRegex = /^[a-zA-Z\s]+$/;
  const modelRegex = /^[\w.-]+$/;

  const files = [fileInput1.files[0], fileInput2.files[0], fileInput3.files[0]];

  if (!nameRegex.test(name.value.trim())) {
    document.getElementById("name-label").style.display = "inline";
    uploadError.innerHTML = "Please enter a valid product name";
    return;
  } else {
    document.getElementById("name-label").style.display = "none";
  }
  if (!modelRegex.test(model.value.trim())) {
    uploadError.innerHTML =
      'Please enter a valid model number(only letters A-Z, "-", "_" and digits 0-9 are allowed)';
    document.getElementById("model-label").style.display = "inline";
    return;
  } else {
    document.getElementById("model-label").style.display = "none";
  }
  if (!stock.value.trim() > 0) {
    uploadError.innerHTML = "Atleast 1 stock is required to add the product";
    document.getElementById("stock-label").style.display = "inline";
    return;
  } else {
    document.getElementById("stock-label").style.display = "none";
  }
  if (!price.value.trim() > 0) {
    uploadError.innerHTML = "Price must be higher than Rs.0";
    document.getElementById("price-label").style.display = "inline";
    return;
  } else {
    document.getElementById("price-label").style.display = "none";
  }
  if (description.value.trim().length == 0) {
    uploadError.innerHTML = "Product description cannot be empty";
    document.getElementById("description-label").style.display = "inline";
    return;
  } else {
    document.getElementById("description-label").style.display = "none";
  }
  if (!nameRegex.test(dialColor.value.trim())) {
    uploadError.innerHTML = "Please enter a valid dial color";
    document.getElementById("dial-label").style.display = "inline";
    return;
  } else {
    document.getElementById("dial-label").style.display = "none";
  }
  if (!nameRegex.test(strapColor.value.trim())) {
    uploadError.innerHTML = "Please enter a valid strap color";
    document.getElementById("strap-label").style.display = "inline";
    return;
  } else {
    document.getElementById("strap-label").style.display = "none";
  }
  if (!fileInput1.files[0] || !fileInput2.files[0] || !fileInput3.files[0]) {
    uploadError.innerHTML = "Please select images to upload";
    document.getElementById("pic-label").style.display = "inline";
    return;
  } else {
    document.getElementById("pic-label").style.display = "none";
  }

  const type = document.getElementById("type").value;

  const formData = new FormData();
  formData.append("name", name.value.trim());
  formData.append("model", model.value.trim());
  formData.append("stock", stock.value.trim());
  formData.append("price", price.value.trim());
  formData.append("categoryId", categoryId);
  formData.append("brandId", brandId);
  formData.append("type", type);
  formData.append("dialColor", dialColor.value.trim());
  formData.append("strapColor", strapColor.value.trim());
  formData.append("description", description.value.trim());
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

  try {
    const response = await fetch("/admin/add-product", {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      window.location.href = "/admin/products";
      localStorage.setItem("toastMessage", "Product added successfully");
    } else {
      const data = await response.json();
      if (response.status == 400) {
        uploadError.innerHTML = data.error;
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
  } catch (error) {
    console.error("Error:", error);
  }
});
