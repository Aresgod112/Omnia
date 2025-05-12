// Initialize users if not exists
if (!localStorage.getItem('users')) {
    // Create admin user
    const users = [
        {
            id: 1,
            username: 'admin',
            password: 'admin',
            role: 'admin',
            name: 'Administrator',
            email: 'admin@example.com'
        }
    ];
    localStorage.setItem('users', JSON.stringify(users));
}

// Initialize current user session
if (!sessionStorage.getItem('currentUser')) {
    sessionStorage.setItem('currentUser', '');
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('loginMessage');
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store current user in session (excluding password)
        const { password, ...userWithoutPassword } = user;
        sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        // Show success message
        messageElement.textContent = 'Autentificare reușită! Redirecționare...';
        messageElement.className = 'message success';
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        // Show error message
        messageElement.textContent = 'Nume de utilizator sau parolă incorecte!';
        messageElement.className = 'message error';
    }
});

// Check if user is logged in
function isLoggedIn() {
    const currentUser = sessionStorage.getItem('currentUser');
    return currentUser !== null && currentUser !== '';
}

// Get current user
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr && userStr !== '' ? JSON.parse(userStr) : null;
}

// Logout function
function logout() {
    // Clear the current user session
    sessionStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// Protect dashboard pages - Stronger protection
(function protectDashboard() {
    if (window.location.pathname.includes('dashboard') &&
        !window.location.pathname.includes('dashboard-no-auth')) {
        
        // Force immediate check
        if (!isLoggedIn()) {
            console.log('Not logged in, redirecting to login page');
            window.location.replace('login.html');
        }
    }
})();

// Add event listener to check login status periodically
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard') &&
        !window.location.pathname.includes('dashboard-no-auth')) {
        
        // Check login status every 5 seconds
        setInterval(function() {
            if (!isLoggedIn()) {
                console.log('Session expired, redirecting to login page');
                window.location.replace('login.html');
            }
        }, 5000);
    }
});