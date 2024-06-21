document.addEventListener("DOMContentLoaded", async () => {
  flatpickr("#custom-date-range", {
    mode: "range",
    dateFormat: "Y-m-d",
  });
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("range")) {
    if (urlParams.get("range") == "day") {
      document.getElementById("filter-day").classList.add("active");
      document.getElementById("date-range").innerHTML =
        "Sales report of the day";
    } else if (urlParams.get("range") == "week") {
      document.getElementById("filter-week").classList.add("active");
      document.getElementById("date-range").innerHTML =
        "Sales report of the week";
    } else if (urlParams.get("range") == "month") {
      document.getElementById("filter-month").classList.add("active");
      document.getElementById("date-range").innerHTML =
        "Sales report of the month";
    } else if (urlParams.get("range") == "year") {
      document.getElementById("filter-year").classList.add("active");
      document.getElementById("date-range").innerHTML =
        "Sales report of the year";
    } else if (urlParams.get("range") == "custom") {
      let startDate = new Date(urlParams.get("startDate"));
      let endDate = new Date(urlParams.get("endDate"));
      startDate = startDate.toLocaleDateString("default", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
      endDate = endDate.toLocaleDateString("default", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
      if (startDate == endDate) {
        document.getElementById(
          "date-range"
        ).innerHTML = `Sales report of ${startDate}`;
      } else {
        document.getElementById(
          "date-range"
        ).innerHTML = `Sales report from ${startDate} to ${endDate}`;
      }
    }
  }
});

document.getElementById("filter-day").addEventListener("click", () => {
  filterSalesReport("day");
});

document.getElementById("filter-week").addEventListener("click", () => {
  filterSalesReport("week");
});

document.getElementById("filter-month").addEventListener("click", () => {
  filterSalesReport("month");
});

document.getElementById("filter-year").addEventListener("click", () => {
  filterSalesReport("year");
});

document.getElementById("submit-btn").addEventListener("click", () => {
  const customRange = document
    .getElementById("custom-date-range")
    .value.split(" to ");
  filterSalesReport("custom", customRange);
});

const filterSalesReport = async (filterType, customRange = []) => {
  let startDate, endDate;

  const today = new Date();
  let range;
  if (filterType == "day") {
    startDate = new Date(today.setHours(0, 0, 0, 0));
    endDate = new Date(today.setHours(23, 59, 59, 999));
    range = "day";
  } else if (filterType == "week") {
    const firstDayOfWeek = today.getDate() - 7;
    startDate = new Date(today.setDate(firstDayOfWeek));
    endDate = new Date(today.setDate(firstDayOfWeek + 7));
    range = "week";
  } else if (filterType == "month") {
    startDate = new Date(today.setDate(1));
    endDate = new Date(today.setMonth(today.getMonth() + 1));
    endDate = new Date(endDate.setDate(0));
    range = "month";
  } else if (filterType == "year") {
    startDate = new Date(today.getFullYear(), 0, 1);
    endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
    range = "year";
  } else if (filterType == "custom") {
    startDate = new Date(customRange[0]);
    endDate = new Date(customRange[1]);
    startDate = new Date(startDate.setHours(0, 0, 0, 0));
    endDate = new Date(endDate.setHours(23, 59, 59, 999));
    range = "custom";
  }
  try {
    if (isNaN(endDate)) {
      startDate = new Date(startDate.setHours(0, 0, 0, 0));
      endDate = new Date(startDate);
      endDate = new Date(endDate.setHours(23, 59, 59, 999));
    }
    const isoStartDate = startDate.toISOString();
    const isoEndDate = endDate.toISOString();
    window.location.href = `/admin/sales-report?startDate=${isoStartDate}&endDate=${isoEndDate}&range=${range}`;
  } catch (err) {
    console.log(err);
  }
};

// pdf downloading
function generateSalesReportPDF(data, totalSold, totalAmount) {
  for (let i = 0; i < data.length; i++) {
    data[i].orderedDate = new Date(data[i].orderDate).toLocaleDateString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    data[i].deliveredDate = new Date(data[i].products.deliveryDate).toLocaleDateString(
      "default",
      { day: "numeric", month: "short", year: "numeric" }
    );
    data[i].quantity = data[i].products.quantity
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Sales Report", 14, 22);

  const columns = [
    { header: "Order ID", dataKey: "OID" },
    { header: "Ordered Date", dataKey: "orderedDate" },
    { header: "Delivery Date", dataKey: "deliveredDate" },
    { header: "User", dataKey: "userName" },
    { header: "Payment Method", dataKey: "paymentMethod" },
    { header: "Product Name", dataKey: "productName" },
    { header: "Price", dataKey: "price" },
    { header: "Quantity", dataKey: "quantity" },
    { header: "Subtotal", dataKey: "subtotal" },
  ];

  doc.autoTable({
    columns: columns,
    body: data,
    startY: 30,
    styles: {
      fontSize: 6,
    },
    headStyles: {
      fontSize: 6,
    },
  });

  doc.setFontSize(10);
  doc.text(`Total Sold: ${totalSold}`, 14, doc.lastAutoTable.finalY + 10);
  doc.text(`Total Amount: Rs. ${totalAmount}`, 14, doc.lastAutoTable.finalY + 17);

  doc.save("Sales_Report.pdf");
}

document.getElementById("pdf-btn").addEventListener("click", async () => {
  const response = await fetch(`/admin/get-orders${window.location.search}`, {
    method: "GET",
  });
  const data = await response.json();
  generateSalesReportPDF(data.orders, data.totalOrders, data.totalAmount);
});

document.getElementById("excel-btn").addEventListener("click", async () => {
  const response = await fetch(`/admin/get-orders${window.location.search}`, {
    method: "GET",
  });
  const data = await response.json();
  for (let i = 0; i < data.orders.length; i++) {
    data.orders[i].orderedDate = new Date(data.orders[i].orderDate).toLocaleDateString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    data.orders[i].deliveredDate = new Date(data.orders[i].products.deliveryDate).toLocaleDateString(
      "default",
      { day: "numeric", month: "short", year: "numeric" }
    );
    data.orders[i].quantity = data.orders[i].products.quantity
  }
  let salesData = data.orders.map((order) => ({
    "Order ID": order.OID,
    "Ordered Date": order.orderedDate,
    "Delivery Date": order.deliveredDate,
    User: order.userName,
    "Payment Method": order.paymentMethod,
    "Product Name": order.productName,
    Price: order.price,
    Quantity: order.quantity,
    Subtotal: order.subtotal,
  }));
  const ws = XLSX.utils.json_to_sheet(salesData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

  XLSX.writeFile(wb, "Sales_Report.xlsx");
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
        window.location.href = `/admin/sales-report?${params.toString()}`;
      } else {
        window.location.href = `/admin/sales-report${search}&page=${page}`;
      }
    } else {
      window.location.href = `/admin/sales-report?page=${page}`;
    }
  }
});
