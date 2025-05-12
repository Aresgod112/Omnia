// DOM Elements
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const sidebar = document.querySelector('.sidebar');
const navLinks = document.querySelectorAll('.sidebar-nav a[data-page]');
const dashboardPages = document.querySelectorAll('.dashboard-page');
const pageTitle = document.getElementById('pageTitle');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplayName = document.getElementById('userDisplayName');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Set user display name
    const currentUser = getCurrentUser();
    if (currentUser) {
        userDisplayName.textContent = currentUser.name;
    }
    
    // Set default date for join date field
    const joinDateInput = document.getElementById('joinDate');
    if (joinDateInput) {
        const today = new Date().toISOString().split('T')[0];
        joinDateInput.value = today;
    }
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Toggle sidebar on mobile
    toggleSidebarBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and pages
            navLinks.forEach(l => l.classList.remove('active'));
            dashboardPages.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get page id
            const pageId = this.getAttribute('data-page') + 'Page';
            
            // Show selected page
            document.getElementById(pageId).classList.add('active');
            
            // Update page title
            updatePageTitle(this.getAttribute('data-page'));
            
            // Close sidebar on mobile
            if (window.innerWidth < 992) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Logout
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Back to list button
    const backToListBtn = document.getElementById('backToList');
    if (backToListBtn) {
        backToListBtn.addEventListener('click', function() {
            showPage('cotizatii');
        });
    }
});

// Update page title
function updatePageTitle(page) {
    switch(page) {
        case 'home':
            pageTitle.textContent = 'Dashboard';
            break;
        case 'adauga':
            pageTitle.textContent = 'Adaugă Membru';
            break;
        case 'cotizatii':
            pageTitle.textContent = 'Cotizații';
            break;
        case 'userProfile':
            pageTitle.textContent = 'Profil Membru';
            break;
        default:
            pageTitle.textContent = 'Dashboard';
    }
}

// Show specific page
function showPage(page) {
    // Remove active class from all links and pages
    navLinks.forEach(l => l.classList.remove('active'));
    dashboardPages.forEach(p => p.classList.remove('active'));
    
    // Add active class to link
    const link = document.querySelector(`.sidebar-nav a[data-page="${page}"]`);
    if (link) {
        link.classList.add('active');
    }
    
    // Show selected page
    const pageId = page + 'Page';
    document.getElementById(pageId).classList.add('active');
    
    // Update page title
    updatePageTitle(page);
}

// Update dashboard stats
function updateDashboardStats() {
    // Get members
    const members = getMembers();
    
    // Update total members
    const totalMembersElement = document.getElementById('totalMembers');
    if (totalMembersElement) {
        totalMembersElement.textContent = members.length;
    }
    
    // Calculate total payments
    let totalPayments = 0;
    members.forEach(member => {
        if (member.payments) {
            member.payments.forEach(payment => {
                totalPayments += parseInt(payment.amount);
            });
        }
    });
    
    // Update total payments
    const totalPaymentsElement = document.getElementById('totalPayments');
    if (totalPaymentsElement) {
        totalPaymentsElement.textContent = totalPayments + ' RON';
    }
}