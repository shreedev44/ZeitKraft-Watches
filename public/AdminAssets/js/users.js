// const blockBtn = document.querySelectorAll('.block')

window.onbeforeunload = function () {
  const scrollY = window.scrollY;
  localStorage.setItem("scrollY", scrollY);
};

window.onload = function () {
  const scrollY = localStorage.getItem("scrollY");
  if (scrollY) {
    window.scrollTo(0, scrollY);
    localStorage.removeItem("scrollY");
  }
};

const blockUser = async (userId, block) => {
  try {
    const body = block ? { isBlocked: false } : { isBlocked: true };
    const response = await fetch(`/admin/users?userId=${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      location.reload();
    }
  } catch (err) {
    console.log(err.message);
  }
};

document.getElementById("table").addEventListener("click", (event) => {
  if (!event.target.matches("button.block")) {
    return;
  }
  const button = event.target;
  const userId = button.getAttribute("data-user-id");
  const isblock = button.getAttribute("data-isblock");
  if (isblock == "true") {
    blockUser(userId, true);
  } else {
    blockUser(userId, false);
  }
});

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
        window.location.href = `/admin/users?${params.toString()}`;
      } else {
        window.location.href = `/admin/users${search}&page=${page}`;
      }
    } else {
      window.location.href = `/admin/users?page=${page}`;
    }
  }
});
