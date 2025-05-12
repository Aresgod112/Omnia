// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    // Initialize localStorage if needed
    initializeLocalStorage();
    
    // Check if we're on a dashboard page
    if (window.location.pathname.includes('dashboard')) {
        // If not logged in, redirect to login
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
        }
    }
});

// Initialize localStorage with default data if needed
function initializeLocalStorage() {
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
    
    // Initialize members if not exists
    if (!localStorage.getItem('members')) {
        localStorage.setItem('members', JSON.stringify([]));
    } else {
        // Ensure members data is valid JSON
        try {
            const members = JSON.parse(localStorage.getItem('members'));
            if (!Array.isArray(members)) {
                // Reset if not an array
                localStorage.setItem('members', JSON.stringify([]));
            }
        } catch (e) {
            // Reset if invalid JSON
            console.error('Invalid members data in localStorage, resetting:', e);
            localStorage.setItem('members', JSON.stringify([]));
        }
    }
}