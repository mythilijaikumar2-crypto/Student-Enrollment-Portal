// Login Logic
document.addEventListener('DOMContentLoaded', () => {
    // Input animations
    const inputs = document.querySelectorAll('.input-group input');

    // Remember Me Logic
    const storedUser = localStorage.getItem('remember_identifier');
    if (storedUser) {
        const idInput = document.getElementById('identifier');
        const rememberBox = document.getElementById('rememberMe');
        if (idInput && rememberBox) {
            idInput.value = storedUser;
            rememberBox.checked = true;
            idInput.parentElement.classList.add('active'); // Trigger floating label
        }
    }



    inputs.forEach(input => {
        // Handle auto-fill
        if (input.value) {
            input.parentElement.classList.add('active');
        }

        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            if (!input.value) {
                input.parentElement.classList.remove('active');
            } else {
                input.parentElement.classList.add('active');
            }
        });

        input.addEventListener('input', () => {
            if (input.value) {
                input.parentElement.classList.add('active');
            }
        });
    });

    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const spinner = loginBtn.querySelector('.spinner');
    const btnText = loginBtn.querySelector('.btn-text');
    const errorMsg = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifier = document.getElementById('identifier').value.trim();
        const password = document.getElementById('password').value;

        if (!identifier || !password) {
            showError('Please enter both identifier and password');
            return;
        }

        // UI Loading State
        setLoading(true);
        hideError();

        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ identifier, password }),
            });

            // Handle Remember Me
            const rememberBox = document.getElementById('rememberMe');
            if (rememberBox && rememberBox.checked) {
                localStorage.setItem('remember_identifier', identifier);
            } else {
                localStorage.removeItem('remember_identifier');
            }

            // Login Success
            setAuth(data);

            // Redirect based on role
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                // Fallback
                window.location.href = data.role === 'admin'
                    ? '/pages/admin/dashboard.html'
                    : '/pages/student/dashboard.html';
            }

        } catch (error) {
            setLoading(false);
            showError(error.message || 'Invalid credentials');
            shakeForm();
        }
    });

    function setLoading(isLoading) {
        loginBtn.disabled = isLoading;
        if (isLoading) {
            spinner.classList.remove('hidden');
            btnText.textContent = 'Authenticating...';
            loginBtn.style.opacity = '0.8';
        } else {
            spinner.classList.add('hidden');
            btnText.textContent = 'Access Portal';
            loginBtn.style.opacity = '1';
        }
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.add('show');
    }

    function hideError() {
        errorMsg.classList.remove('show');
    }

    function shakeForm() {
        const card = document.querySelector('.login-card');
        card.classList.remove('shake');
        void card.offsetWidth; // Trigger reflow
        card.classList.add('shake');
    }
});
