const inputs = document.querySelectorAll(".otp-field input");

inputs.forEach((input, index) => {
    input.dataset.index = index;
    input.addEventListener("keyup", handleOtp);
    input.addEventListener("paste", handleOnPasteOtp);
});

function handleOtp(e) {
    
    const input = e.target;
    let value = input.value;
    let isValidInput = value.match(/[0-9a-z]/gi);
    input.value = "";
    input.value = isValidInput ? value[0] : "";

    let fieldIndex = input.dataset.index;
    if (fieldIndex < inputs.length - 1 && isValidInput) {
        input.nextElementSibling.focus();
    }

    if (e.key === "Backspace" && fieldIndex > 0) {
        input.previousElementSibling.focus();
    }

    if (fieldIndex == inputs.length - 1 && isValidInput) {
        submit();
    }
}

function handleOnPasteOtp(e) {
    const data = e.clipboardData.getData("texts");
    const value = data.split("");
    if (value.length === inputs.length) {
        inputs.forEach((input, index) => (input.value = value[index]));
        submit();
    }
}


const resendLink = document.getElementById('resend');
const resendMsg = document.getElementById('resend-msg');
const displayTime = document.getElementById('timer');

resendLink.style.display = 'none';
resendMsg.style.display = 'inline';

const enableResend = () => {
  resendLink.style.display = 'inline';
  resendMsg.style.display = 'none';
}

const timer = () => {
  let i = 30;
  let interval = setInterval(() => {
    displayTime.innerHTML = i;
    i--;
    if (i < 0) {
      clearInterval(interval);
      enableResend();
    }
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  timer();
});

resendLink.addEventListener('click', async () => {
    resendLink.style.display = 'none';
    resendMsg.style.display = 'inline';
    displayTime.innerHTML = '30'
    timer();
    const response = await fetch('http://localhost:3000/resend-otp', {
        method: 'GET'
    })
    if(!response.ok){
        alert('There was a problem while resending otp');
    }
})


async function submit() {
     try{
         let otp = "";
         inputs.forEach((input) => {
             otp += input.value;
         });

        

         
         const response = await fetch(`http://localhost:3000/verify-otp`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify({
                otp: otp
             })
         });
         if(response.ok){
            window.location.href = '/login';
         }
         else {
            document.getElementById('incorrect').style.display = 'inline';
            const form = document.getElementById('otp-form');
            form.reset();
            handleOtp();
            handleOnPasteOtp();
         }
     }
     catch (err) {
        console.log(err.message);
        throw err;
     }

}
