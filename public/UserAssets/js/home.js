document.addEventListener("DOMContentLoaded", () => {
  const toastMessage = localStorage.getItem("toastMessage");

  if (toastMessage) {
    Toastify({
      text: toastMessage,
      className: "success",
      gravity: "top",
      position: "center",
      style: {
        background: "#132451",
      },
    }).showToast();

    localStorage.removeItem("toastMessage");
  }
});
