document.getElementById('login-form').addEventListener('submit', (event) => {
    event.preventDefault();


    const email = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(email.value.trim())){
        emailError.innerHTML = 'Please enter a valid email'
    }
    else{
        emailError.innerHTML = ''
        sendData();
    }
    
    async function sendData () {
        const form = document.getElementById('login-form')
        const formData = new FormData(form);
        const serializedFormData = JSON.stringify(Object.fromEntries(formData))
        const checkBox = document.getElementById('checkbox').checked ? 'store' : '';
        try{
            const response = await fetch(`/login?cookie=${checkBox}`, {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: serializedFormData,
            });
            if(response.ok){
                location.reload();
            }
            else{
                const userError = document.getElementById('user-error');
                const data = await response.json();
                userError.innerHTML = data.message;
            }
        }
        catch(err) {
            console.log(err.message)
        }
    }
})

function initGoogleSignIn() {
    gapi.load('auth2', function() {
        const auth2 = gapi.auth2.init({
            client_id: '287622461932-ujujad18p0mnv47pq0gkglmtk13d3ogh.apps.googleusercontent.com',
            scope: 'profile email', // Specify the scopes you need
        });

        // Attach click event to your custom button
        document.getElementById('google-signin-btn').addEventListener('click', function(event) {
            event.preventDefault();
            auth2.signIn().then(function(googleUser) {
                // Handle successful sign-in
                const profile = googleUser.getBasicProfile();
                console.log('Signed in as: ' + profile.getName());
                console.log('Email: ' + profile.getEmail());
                console.log('ID: ' + profile.getId());
                console.log('Image URL: ' + profile.getImageUrl());
                // You can perform further actions here, such as sending the user's data to your server
            }).catch(function(error) {
                // Handle error
                console.error('Google Sign-In Error:', error);
            });
        });
    });
}

window.onload = function() {
    gapi.load('auth2', initGoogleSignIn);
};
