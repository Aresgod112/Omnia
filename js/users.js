// Initialize members if not exists
if (!localStorage.getItem('members')) {
    localStorage.setItem('members', JSON.stringify([]));
}

// DOM Elements
const addUserForm = document.getElementById('addUserForm');
const addUserMessage = document.getElementById('addUserMessage');
const searchUserInput = document.getElementById('searchUser');
const searchBtn = document.getElementById('searchBtn');
const membersTableBody = document.getElementById('membersTableBody');
const noMembersMessage = document.getElementById('noMembersMessage');

// Initialize Users
document.addEventListener('DOMContentLoaded', function() {
    // Add User Form
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addMember();
        });
    }
    
    // Search User
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            searchMembers();
        });
    }
    
    if (searchUserInput) {
        searchUserInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchMembers();
            }
        });
    }
    
    // Load Members
    loadMembers();
});

// Get Members from localStorage
function getMembers() {
    return JSON.parse(localStorage.getItem('members')) || [];
}

// Save Members to localStorage
function saveMembers(members) {
    localStorage.setItem('members', JSON.stringify(members));
}

// Add New Member
function addMember() {
    const lastName = document.getElementById('lastName').value;
    const firstName = document.getElementById('firstName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const idType = document.querySelector('input[name="idType"]:checked').value;
    const idSeries = document.getElementById('idSeries').value;
    const idNumber = document.getElementById('idNumber').value;
    const company = document.getElementById('company').value;
    const joinDate = document.getElementById('joinDate').value;
    
    // Get existing members
    const members = getMembers();
    
    // Create new member
    const newMember = {
        id: Date.now(),
        lastName,
        firstName,
        fullName: `${lastName} ${firstName}`,
        email,
        phone,
        address,
        idType,
        idSeries,
        idNumber,
        company,
        joinDate,
        payments: []
    };
    
    // Add to members array
    members.push(newMember);
    
    // Save to localStorage
    saveMembers(members);
    
    // Show success message
    addUserMessage.textContent = 'Membru adăugat cu succes!';
    addUserMessage.className = 'message success';
    
    // Reset form
    addUserForm.reset();
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Clear message after 3 seconds
    setTimeout(() => {
        addUserMessage.textContent = '';
        addUserMessage.className = 'message';
    }, 3000);
}

// Load Members
function loadMembers(searchTerm = '') {
    if (!membersTableBody) return;
    
    // Get members
    let members = getMembers();
    
    // Filter by search term if provided
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        members = members.filter(member => 
            member.name.toLowerCase().includes(term)
        );
    }
    
    // Clear table
    membersTableBody.innerHTML = '';
    
    // Show/hide no members message
    if (members.length === 0) {
        noMembersMessage.style.display = 'block';
        return;
    } else {
        noMembersMessage.style.display = 'none';
    }
    
    // Populate table
    members.forEach(member => {
        // Calculate total payments
        let totalPayments = 0;
        if (member.payments) {
            member.payments.forEach(payment => {
                totalPayments += parseInt(payment.amount);
            });
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.lastName || ''}</td>
            <td>${member.firstName || ''}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${member.company || '-'}</td>
            <td>${formatDate(member.joinDate)}</td>
            <td>${totalPayments} RON</td>
            <td>
                <button class="action-btn view" data-id="${member.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete" data-id="${member.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        membersTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    addActionButtonListeners();
}

// Search Members
function searchMembers() {
    const searchTerm = searchUserInput.value.trim();
    loadMembers(searchTerm);
}

// Add Action Button Listeners
function addActionButtonListeners() {
    // View Member
    const viewButtons = document.querySelectorAll('.action-btn.view');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            viewMember(memberId);
        });
    });
    
    // Delete Member
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            deleteMember(memberId);
        });
    });
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
}

// View Member
function viewMember(memberId) {
    // Get member
    const members = getMembers();
    const member = members.find(m => m.id == memberId);
    
    if (!member) return;
    
    // Set member data in profile page
    document.getElementById('profileLastName').textContent = member.lastName || '';
    document.getElementById('profileFirstName').textContent = member.firstName || '';
    document.getElementById('profileEmail').textContent = member.email;
    document.getElementById('profilePhone').textContent = member.phone;
    document.getElementById('profileAddress').textContent = member.address;
    document.getElementById('profileIdType').textContent = member.idType || 'CI';
    document.getElementById('profileIdSeries').textContent = member.idSeries || '';
    document.getElementById('profileIdNumber').textContent = member.idNumber || '';
    document.getElementById('profileCompany').textContent = member.company || '-';
    document.getElementById('profileJoinDate').textContent = formatDate(member.joinDate);
    
    // Store current member ID for payment form
    sessionStorage.setItem('currentMemberId', memberId);
    
    // Load payments
    loadPayments(member);
    
    // Show profile page
    showPage('userProfile');
}

// Delete Member
function deleteMember(memberId) {
    if (!confirm('Sigur doriți să ștergeți acest membru?')) return;
    
    // Get members
    let members = getMembers();
    
    // Filter out the member to delete
    members = members.filter(m => m.id != memberId);
    
    // Save to localStorage
    saveMembers(members);
    
    // Reload members
    loadMembers();
    
    // Update dashboard stats
    updateDashboardStats();
}

// Get Member by ID
function getMemberById(memberId) {
    const members = getMembers();
    return members.find(m => m.id == memberId);
}

// Update Member
function updateMember(member) {
    // Get members
    let members = getMembers();
    
    // Find index of member to update
    const index = members.findIndex(m => m.id == member.id);
    
    if (index !== -1) {
        // Update member
        members[index] = member;
        
        // Save to localStorage
        saveMembers(members);
        
        // Update dashboard stats
        updateDashboardStats();
        
        return true;
    }
    
    return false;
}