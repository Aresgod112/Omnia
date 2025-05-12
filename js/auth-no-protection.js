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
    // Set a default user to allow dashboard access without login
    const defaultUser = {
        id: 0,
        username: 'guest',
        role: 'guest',
        name: 'Guest User',
        email: 'guest@example.com'
    };
    sessionStorage.setItem('currentUser', JSON.stringify(defaultUser));
}

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
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

// Check if user is logged in (always returns true now)
function isLoggedIn() {
    return true; // Always return true to allow access
}

// Get current user
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Logout function
function logout() {
    // Set back to default guest user instead of clearing
    const defaultUser = {
        id: 0,
        username: 'guest',
        role: 'guest',
        name: 'Guest User',
        email: 'guest@example.com'
    };
    sessionStorage.setItem('currentUser', JSON.stringify(defaultUser));
    window.location.href = '../index.html';
}

// No protection for dashboard pages - removed the redirect code