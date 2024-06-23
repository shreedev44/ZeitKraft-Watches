const filterWeek = document.getElementById('filter-week');
const filterMonth = document.getElementById('filter-month');
const filterYear = document.getElementById('filter-year');
let labels = [];
let label;
if(chartData.salesData.length == 12){
  labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ]
  filterMonth.classList.add('active');
  label = 'Sales per month'
}
else if(chartData.salesData.length == 7){
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = new Date().getDay();
  labels = days.slice(currentDay).concat(days.slice(0, currentDay));
  filterWeek.classList.add('active');
  label = 'Sales of the week'
}
else if(chartData.salesData.length == 5){
  const currentYear = new Date().getFullYear();
  for(let i = 4; i >= 0; i--){
    labels.push(currentYear - i);
  }
  filterYear.classList.add('active');
  label = 'Sales per year'
}

const salesDataSet = {
  labels: labels,
  datasets: [
    {
      label: label,
      data: chartData.salesData,
      backgroundColor: ["rgba(54, 162, 235, 0.2)"],
      borderColor: ["rgb(54, 162, 235)"],
      borderWidth: 1,
    },
  ],
};

const ordersDataSet = {
  labels: ["Cancelled Orders", "Returned Orders", "Delivered Orders"],
  datasets: [
    {
      label: "Order count",
      data: chartData.orderData,
      backgroundColor: [
        "rgba(255, 0, 0, 0.2)",
        "rgba(255, 204, 0, 0.2)",
        "rgba(54, 162, 235, 0.2)",
      ],
      borderColor: [
        "rgba(255, 0, 0)",
        "rgba(255, 204, 0)",
        "rgba(54, 162, 235)",
      ],
      borderWidth: 1,
    },
  ],
};

const pieConfig = {
  type: "doughnut",
  data: ordersDataSet,
};

const config = {
  type: "bar",
  data: salesDataSet,
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
};

var myChart = new Chart(document.getElementById("barChart"), config);

var pieChart = new Chart(document.getElementById("pieChart"), pieConfig);

filterWeek.addEventListener('click', () => {
  window.location.href = '/admin/dashboard?filter=weekly';
})
filterMonth.addEventListener('click', () => {
  window.location.href = '/admin/dashboard?filter=monthly';
})
filterYear.addEventListener('click', () => {
  window.location.href = '/admin/dashboard?filter=yearly';
})