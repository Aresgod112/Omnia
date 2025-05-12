// Supabase Users Management
// This file replaces the localStorage-based users.js with Supabase implementation

// DOM Elements
const addUserForm = document.getElementById('addUserForm');
const addUserMessage = document.getElementById('addUserMessage');
const searchUserInput = document.getElementById('searchUser');
const searchBtn = document.getElementById('searchBtn');
const membersTableBody = document.getElementById('membersTableBody');
const noMembersMessage = document.getElementById('noMembersMessage');

// Initialize Users
document.addEventListener('DOMContentLoaded', function() {
    // Check if Supabase is initialized
    if (typeof supabase === 'undefined') {
        console.error('Supabase client is not initialized. Make sure supabase-config.js is loaded before this file.');
        return;
    }

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

// Get Members from Supabase
async function getMembers() {
    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .order('last_name', { ascending: true });
        
        if (error) {
            console.error('Error fetching members:', error);
            return [];
        }
        
        return data || [];
    } catch (e) {
        console.error('Exception fetching members:', e);
        return [];
    }
}

// Add New Member
async function addMember() {
    try {
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
        
        // Insert member into Supabase
        const { data, error } = await supabase
            .from('members')
            .insert([
                {
                    last_name: lastName,
                    first_name: firstName,
                    email,
                    phone,
                    address,
                    id_type: idType,
                    id_series: idSeries,
                    id_number: idNumber,
                    company,
                    join_date: joinDate
                }
            ])
            .select();
        
        if (error) {
            console.error('Error adding member:', error);
            addUserMessage.textContent = 'Eroare la adăugarea membrului: ' + error.message;
            addUserMessage.className = 'message error';
            return;
        }
        
        // Show success message
        addUserMessage.textContent = 'Membru adăugat cu succes!';
        addUserMessage.className = 'message success';
        
        // Reset form
        addUserForm.reset();
        
        // Set default date to today
        const joinDateInput = document.getElementById('joinDate');
        if (joinDateInput) {
            const today = new Date().toISOString().split('T')[0];
            joinDateInput.value = today;
        }
        
        // Update dashboard stats
        updateDashboardStats();
        
        // Clear message after 3 seconds
        setTimeout(() => {
            addUserMessage.textContent = '';
            addUserMessage.className = 'message';
        }, 3000);
    } catch (e) {
        console.error('Exception adding member:', e);
        addUserMessage.textContent = 'Eroare la adăugarea membrului: ' + e.message;
        addUserMessage.className = 'message error';
    }
}

// Load Members
async function loadMembers(searchTerm = '') {
    if (!membersTableBody) return;
    
    try {
        // Get members from Supabase
        let query = supabase.from('members').select('*');
        
        // Filter by search term if provided
        if (searchTerm) {
            query = query.or(`last_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%`);
        }
        
        const { data: members, error } = await query;
        
        if (error) {
            console.error('Error loading members:', error);
            noMembersMessage.style.display = 'block';
            return;
        }
        
        // Clear table
        membersTableBody.innerHTML = '';
        
        // Show/hide no members message
        if (!members || members.length === 0) {
            noMembersMessage.style.display = 'block';
            return;
        } else {
            noMembersMessage.style.display = 'none';
        }
        
        // For each member, get their total payments
        for (const member of members) {
            // Get payments for this member
            const { data: payments, error: paymentsError } = await supabase
                .from('payments')
                .select('amount')
                .eq('member_id', member.id);
            
            // Calculate total payments
            let totalPayments = 0;
            if (!paymentsError && payments) {
                payments.forEach(payment => {
                    totalPayments += parseFloat(payment.amount);
                });
            }
            
            // Create table row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.last_name || ''}</td>
                <td>${member.first_name || ''}</td>
                <td>${member.email || ''}</td>
                <td>${member.phone || ''}</td>
                <td>${member.company || '-'}</td>
                <td>${formatDate(member.join_date) || '-'}</td>
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
        }
        
        // Add action button listeners
        addActionButtonListeners();
    } catch (e) {
        console.error('Exception loading members:', e);
        noMembersMessage.style.display = 'block';
    }
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

// View Member
async function viewMember(memberId) {
    try {
        // Get member from Supabase
        const { data: member, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', memberId)
            .single();
        
        if (error || !member) {
            console.error('Error fetching member:', error);
            return;
        }
        
        // Set member data in profile page
        document.getElementById('profileLastName').textContent = member.last_name || '';
        document.getElementById('profileFirstName').textContent = member.first_name || '';
        document.getElementById('profileEmail').textContent = member.email || '';
        document.getElementById('profilePhone').textContent = member.phone || '';
        document.getElementById('profileAddress').textContent = member.address || '';
        document.getElementById('profileIdType').textContent = member.id_type || 'CI';
        document.getElementById('profileIdSeries').textContent = member.id_series || '';
        document.getElementById('profileIdNumber').textContent = member.id_number || '';
        document.getElementById('profileCompany').textContent = member.company || '-';
        document.getElementById('profileJoinDate').textContent = formatDate(member.join_date) || '-';
        
        // Store current member ID for payment form
        sessionStorage.setItem('currentMemberId', memberId);
        
        // Load payments
        loadPayments(memberId);
        
        // Show profile page
        showPage('userProfile');
    } catch (e) {
        console.error('Exception viewing member:', e);
    }
}

// Delete Member
async function deleteMember(memberId) {
    if (!confirm('Sigur doriți să ștergeți acest membru?')) return;
    
    try {
        // Delete member from Supabase
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', memberId);
        
        if (error) {
            console.error('Error deleting member:', error);
            alert('Eroare la ștergerea membrului: ' + error.message);
            return;
        }
        
        // Reload members
        loadMembers();
        
        // Update dashboard stats
        updateDashboardStats();
    } catch (e) {
        console.error('Exception deleting member:', e);
        alert('Eroare la ștergerea membrului: ' + e.message);
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
}