const parentDiv = document.getElementById("parent-div");
parentDiv.addEventListener("click", async (event) => {
  try {
    if (event.target.id == "copy-btn") {
      event.preventDefault();

      var copyText = event.target.getAttribute("data-coupon-code");
      var textArea = document.createElement("textarea");
      textArea.value = copyText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      Toastify({
        text: "Code copied",
        className: "success",
        gravity: "top",
        position: "center",
        style: {
          background: "#132451",
        },
      }).showToast();
    }
  } catch (err) {
    console.log(err);
  }
});
