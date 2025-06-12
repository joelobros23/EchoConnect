document.addEventListener('DOMContentLoaded', function() {

    const registerForm = document.querySelector('#registerForm');
    const loginForm = document.querySelector('#loginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(registerForm);

            fetch('api/register.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    alert('Registration failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Registration failed due to a network error.');
            });
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(loginForm);

            fetch('api/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('username', data.username);

                    alert('Login successful!');
                    window.location.href = 'home.html';
                } else {
                    alert('Login failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Login failed due to a network error.');
            });
        });
    }

    // Logout functionality
    function logout() {
        fetch('api/logout.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({token: localStorage.getItem('token')})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');

                alert('Logout successful!');
                window.location.href = 'index.html';
            } else {
                alert('Logout failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Logout failed due to a network error.');
        });
    }

    // Attach logout function to a button if it exists.  Assumes button with id="logoutBtn"
    const logoutBtn = document.querySelector('#logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Function to check authentication status (example usage on other pages)
    function checkAuth() {
        if (!localStorage.getItem('token')) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Example usage: Call checkAuth() on pages that require authentication

});