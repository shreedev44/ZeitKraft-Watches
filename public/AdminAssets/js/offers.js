document.addEventListener("DOMContentLoaded", () => {
  const toastMessage = window.localStorage.getItem("toastMessage");
  if (toastMessage) {
    Toastify({
      text: toastMessage,
      className: "success",
      gravity: "top",
      position: "center",
      style: {
        background: "#28a745",
      },
    }).showToast();
    window.localStorage.removeItem("toastMessage");
  }
});

