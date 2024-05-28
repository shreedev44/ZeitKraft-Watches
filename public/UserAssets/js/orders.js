// const ordersTable = document.getElementById("orders-table");

// ordersTable.addEventListener("click", async (event) => {
//     if(event.target.id == 'track-btn'){
//         event.preventDefault();

//         const orderId = event.target.getAttribute('data-order-id');
//         try{
//             const response = await fetch(`/track-order`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     orderId: orderId
//                 })
//             })

//             if(response.redirected){
//                 window.location.href = response.url;
//             }
//         }
//         catch(err){
//             console.log(err)
//         }
//     }
// })