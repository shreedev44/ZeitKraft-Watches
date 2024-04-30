document.addEventListener("DOMContentLoaded", () => {
  let cropper;
  const addCategoryForm = document.getElementById("add-category-form");
  const categoryName = document.getElementById("category-name");
  const fileInput = document.getElementById("upload-file");
  const uploadError = document.getElementById("upload-error");
  const addBtn = document.getElementById("add-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const nameRegex = /^[a-zA-Z]+$/;

  cancelBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = '/admin/categories';
  })

  addCategoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if(!nameRegex.test(categoryName.value.trim())){
      uploadError.innerHTML = 'Please enter a valid category name';
      return;
    }

    if (!fileInput.files[0]) {
      uploadError.innerHTML = "Please select a file to upload";
    } else {
      const formData = new FormData();

      const file = fileInput.files[0];
      formData.append("file", file);

      formData.append("title", categoryName.value);
      try {
        const response = await fetch(`/admin/add-category`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          window.location.href = "/admin/categories";
          localStorage.setItem('toastMessage', 'Category added successfully');
        } else {
          const data = await response.json();
          if(response.status == 400){
            uploadError.innerHTML = data.error;
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
      } catch (err) {
        console.log(err.message);
      }
    }
  });
  const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

  fileInput.addEventListener("change", (event) => {
    if (!fileInput.files[0]) {
      uploadError.innerHTML = "Please select a file to upload";
    } else {
      const file = event.target.files[0];
      const fileType = file.type;
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (
        !allowedExtensions.has(fileExtension) ||
        !fileType.includes("image/")
      ) {
        uploadError.innerHTML =
          "Please select a valid image file (JPG, JPEG, PNG, or WEBP).";
        fileInput.value = "";
        return;
      } else {
        if(file && file.size > 5 * 1024 * 1024){
          uploadError.innerHTML = 'File is too large. The file size limit is 1MB';
          fileInput.value = '';
          return;
        }

        const cropField = document.getElementById("crop-field");
        const cropBtn = document.getElementById("crop-btn");

        if (cropper) {
          cropper.destroy();
          cropper = null;
        }

        const image = new Image();

        image.src = window.URL.createObjectURL(file);

        image.addEventListener("load", () => {
          cropBtn.classList.remove("d-none");
          addBtn.classList.add("d-none");
          cancelBtn.classList.add("d-none");
          cropField.innerHTML = "";
          image.classList.add("img-fluid", "w-50");
          cropField.appendChild(image);

          cropper = new Cropper(image, {
            aspectRatio: 1 / 1,
            cropBoxMovable: true,
            cropBoxResizable: true,
            dragMode: "move",
          });
        });

        cropBtn.addEventListener("click", async (event) => {
          event.preventDefault();
          uploadError.innerHTML = '';
          if (cropper) {
              try {
                  async function dataURLtoFile(dataURL, fileName, originalFile) {
                      const response = await fetch(dataURL);
                      const blob = await response.blob();
                    
                      const mimeType = blob.type ?? originalFile.type;
                      const file = new File([blob], fileName, { type: mimeType });
                    
                      return file;
                  }
      
                  const croppedCanvas = cropper.getCroppedCanvas();
                  const croppedImageDataURL = croppedCanvas.toDataURL();
      
                  const newFile = await dataURLtoFile(
                      croppedImageDataURL,
                      file.name,
                      file
                  );
      
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(newFile);
      
                  fileInput.dispatchEvent(
                      new ClipboardEvent("change", {
                          bubbles: true,
                          cancelable: false,
                      })
                  );
                  fileInput.files = dataTransfer.files;
                  
                  // Clean up after successful upload
                  setTimeout(() => {
                      cropper.destroy();
                      cropField.innerHTML = "";
                      cropBtn.classList.add("d-none");
                      addBtn.classList.remove("d-none");
                      cancelBtn.classList.remove("d-none");
                      document.getElementById('image-output').src = croppedImageDataURL
                  }, 100);
              } catch (err) {
                  console.log(err.message);
              }
          } else {
              console.log("cropper not found");
          }
      });
      
      }
    }
  });
});

