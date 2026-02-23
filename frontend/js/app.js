const API_URL = 'http://localhost:5000/api';

// Helper to get token
const getToken = () => localStorage.getItem('token');

// Helper to set token and user info
const setAuth = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
};

// Helper for custom modal
const customConfirm = (message, title = 'Confirm Action', confirmText = 'Confirm') => {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-confirm-overlay';

        overlay.innerHTML = `
            <div class="custom-confirm-box">
                <div class="confirm-title">${title}</div>
                <div class="confirm-message">${message}</div>
                <div class="confirm-actions">
                    <button class="btn btn-outline" id="confirmCancel">Cancel</button>
                    <button class="btn btn-danger" id="confirmOk">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animation
        requestAnimationFrame(() => overlay.classList.add('show'));

        const close = (result) => {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
                resolve(result);
            }, 300);
        };

        document.getElementById('confirmCancel').onclick = () => close(false);
        document.getElementById('confirmOk').onclick = () => close(true);
    });
};

// Helper for custom alert
const customAlert = (message, title = 'Notification') => {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-confirm-overlay';

        overlay.innerHTML = `
            <div class="custom-confirm-box">
                <div class="confirm-title">${title}</div>
                <div class="confirm-message">${message}</div>
                <div class="alert-actions">
                    <button class="btn btn-primary" id="alertOk">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animation
        requestAnimationFrame(() => overlay.classList.add('show'));

        const close = () => {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
                resolve(true);
            }, 300);
        };

        document.getElementById('alertOk').onclick = () => close();
    });
};

// Helper to logout
const logout = async () => {
    const startLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    };

    if (await customConfirm('Are you sure you want to log out?', 'Sign Out', 'Logout')) {
        startLogout();
    }
};

// Helper for fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// Check auth on protected pages
const checkAuth = (role) => {
    const token = getToken();
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = '/login.html';
        return;
    }

    if (role && user.role !== role) {
        alert('Unauthorized access');
        window.location.href = '/index.html';
    }

    // Show user name if element exists
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = user.name;
};
