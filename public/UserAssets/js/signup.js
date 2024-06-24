

const lodash = window._;

document.addEventListener('DOMContentLoaded', () => {
  const firstName = document.getElementById('first-name');
  const lastName = document.getElementById('last-name');
  const email = document.getElementById('signup-email');
  const password = document.getElementById('signup-password-field');
  const cPassword = document.getElementById('signup-cpassword-field');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const cPasswordError = document.getElementById('cpassword-error');

  const nameRegex = /^[a-zA-Z]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const minLengthRegex = /^.{8,}$/;
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  const numberRegex = /\d/;

  if(window.location.search){
    const search = new URLSearchParams(window.location.search);
    document.getElementById("referral-code").value = search.get('referralCode');
  }

  const validateFName = () => {
    const name = firstName.value.trim();

    if(!nameRegex.test(name) && name != ''){
      nameError.innerHTML = 'Name can only contain letters';
      cPasswordError.innerHTML = '';
    }
    else{
        nameError.innerHTML = '';
    }
  };

  const validateLName = () => {
    const lastNameValue = lastName.value.trim();

    if(!nameRegex.test(lastNameValue) && lastNameValue != ''){
      nameError.innerHTML = 'Name can only contain letters';
      cPasswordError.innerHTML = '';
    }
    else if(lastNameValue == ''){
        nameError.innerHTML = 'Name cannot be empty';
        cPasswordError.innerHTML = '';
    }
    else{
        nameError.innerHTML = '';
    }
  };

  const validateEmail = () => {
    const emailValue = email.value.trim();

    if(!emailRegex.test(emailValue) && emailValue != ''){
        emailError.innerHTML = 'Invalid email format';
        cPasswordError.innerHTML = '';
    }
    else if(emailValue == ''){
        emailError.innerHTML = 'Email cannot be empty';
        cPasswordError.innerHTML = '';
    }
    else{
        emailError.innerHTML = '';
    }
  }

  const validatePassword = () => {
    const passwordValue = password.value.trim();

    if(!minLengthRegex.test(passwordValue) && passwordValue != ''){
        passwordError.innerHTML = 'The password must contain min 8 characters';
        cPasswordError.innerHTML = '';
      }
      else if(!specialCharRegex.test(passwordValue) && passwordValue != ''){
        passwordError.innerHTML = 'The password must contain a special character';
        cPasswordError.innerHTML = '';
      }
      else if(!numberRegex.test(passwordValue) && passwordValue != ''){
        passwordError.innerHTML = 'The password must contain a number';
        cPasswordError.innerHTML = '';
      }
      else if(passwordValue == ''){
        passwordError.innerHTML = 'The password cannot be empty';
        cPasswordError.innerHTML = '';
      }
      else{
        passwordError.innerHTML = '';
      }
  }

  const validateCPassword = () => {
    const passwordValue = password.value.trim();
    const cPasswordValue = cPassword.value.trim();

    if (passwordValue !== cPasswordValue) {
        cPasswordError.innerHTML = 'Passwords do not match';
      }
      else{
        cPasswordError.innerHTML = '';
      }
  }

  const debouncedValidateFName = lodash.debounce(validateFName, 500);
  const debouncedValidateLName = lodash.debounce(validateLName, 500);
  const debouncedValidateEmail = lodash.debounce(validateEmail, 500);
  const debouncedValidatePassword = lodash.debounce(validatePassword, 500);
  const debouncedValidateCPassword = lodash.debounce(validateCPassword, 500);

  firstName.addEventListener('input', debouncedValidateFName);
  lastName.addEventListener('input', debouncedValidateLName);
  email.addEventListener('input', debouncedValidateEmail);
  password.addEventListener('input', debouncedValidatePassword);
  cPassword.addEventListener('input', debouncedValidateCPassword);



  const signupForm = document.getElementById('signup-form')
  signupForm.addEventListener('submit', (event) => {
    let submit = true;
      event.preventDefault();
      if(!nameRegex.test(firstName.value.trim()) || !nameRegex.test(lastName.value.trim())){
        nameError.innerHTML = 'Name can only contain letters';
        submit = false;
      }
      if(!emailRegex.test(email.value.trim())){
        emailError.innerHTML = 'Invalid email format';
        submit = false;
      }
      if(!minLengthRegex.test(password.value.trim())){
        passwordError.innerHTML = 'The password must contain min 8 characters';
        submit = false;
      }
      else if(!specialCharRegex.test(password.value.trim())){
        passwordError.innerHTML = 'The password must contain a special character';
        submit = false;
      }
      else if(!numberRegex.test(password.value.trim())){
        passwordError.innerHTML = 'The password must contain a number';
        submit = false;
      }
      if(password.value.trim() !== cPassword.value.trim()){
        cPasswordError.innerHTML = 'Passwords do not match';
        submit = false;
      }

      if(submit){
        signupForm.submit();
      }
  })
});



