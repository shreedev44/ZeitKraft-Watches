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
function generateSalesReportPDF(data) {
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

  doc.save("Sales_Report.pdf");
}

document.getElementById("pdf-btn").addEventListener("click", () => {
  generateSalesReportPDF(salesData);
});

document.getElementById("excel-btn").addEventListener("click", () => {
    salesData = salesData.map((order) => ({
        "Order ID": order.OID,
        "Ordered Date": order.orderedDate,
        "Delivery Date": order.deliveredDate,
        "User": order.userName,
        "Payment Method": order.paymentMethod,
        "Product Name": order.productName,
        "Price": order.price,
        "Quantity": order.quantity,
        "Subtotal": order.subtotal
    }))
      const ws = XLSX.utils.json_to_sheet(salesData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
  
      XLSX.writeFile(wb, 'Sales_Report.xlsx');
})
