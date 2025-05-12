// DOM Elements
const addPaymentBtn = document.getElementById('addPaymentBtn');
const addPaymentForm = document.getElementById('addPaymentForm');
const paymentForm = document.getElementById('paymentForm');
const cancelPaymentBtn = document.getElementById('cancelPayment');
const paymentsTableBody = document.getElementById('paymentsTableBody');
const noPaymentsMessage = document.getElementById('noPaymentsMessage');

// Initialize Payments
document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    const paymentDateInput = document.getElementById('paymentDate');
    if (paymentDateInput) {
        const today = new Date().toISOString().split('T')[0];
        paymentDateInput.value = today;
    }
    
    // Show/Hide Payment Form
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', function() {
            addPaymentForm.classList.remove('hidden');
        });
    }
    
    if (cancelPaymentBtn) {
        cancelPaymentBtn.addEventListener('click', function() {
            addPaymentForm.classList.add('hidden');
            paymentForm.reset();
        });
    }
    
    // Add Payment
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addPayment();
        });
    }
});

// Load Payments for Member
function loadPayments(member) {
    if (!paymentsTableBody || !noPaymentsMessage) return;
    
    // Clear table
    paymentsTableBody.innerHTML = '';
    
    // Check if member has payments
    if (!member.payments || member.payments.length === 0) {
        noPaymentsMessage.style.display = 'block';
        return;
    } else {
        noPaymentsMessage.style.display = 'none';
    }
    
    // Sort payments by date (newest first)
    const sortedPayments = [...member.payments].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Populate table
    sortedPayments.forEach(payment => {
        const row = document.createElement('tr');
        
        // Format date
        const paymentDate = new Date(payment.date);
        const formattedDate = paymentDate.toLocaleDateString('ro-RO');
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${payment.amount} RON</td>
            <td>${payment.notes || '-'}</td>
        `;
        
        paymentsTableBody.appendChild(row);
    });
}

// Add Payment
function addPayment() {
    // Get form values
    const amount = document.getElementById('paymentAmount').value;
    const date = document.getElementById('paymentDate').value;
    const notes = document.getElementById('paymentNotes').value;
    
    // Get current member ID
    const memberId = sessionStorage.getItem('currentMemberId');
    
    if (!memberId) {
        alert('Eroare: Nu s-a putut identifica membrul.');
        return;
    }
    
    // Get member
    const member = getMemberById(memberId);
    
    if (!member) {
        alert('Eroare: Membrul nu a fost găsit.');
        return;
    }
    
    // Create payment object
    const payment = {
        id: Date.now(),
        amount,
        date,
        notes,
        createdAt: new Date().toISOString()
    };
    
    // Add payment to member
    if (!member.payments) {
        member.payments = [];
    }
    
    member.payments.push(payment);
    
    // Update member
    if (updateMember(member)) {
        // Show success message
        alert('Cotizație adăugată cu succes!');
        
        // Reset and hide form
        paymentForm.reset();
        addPaymentForm.classList.add('hidden');
        
        // Set default date to today
        const paymentDateInput = document.getElementById('paymentDate');
        if (paymentDateInput) {
            const today = new Date().toISOString().split('T')[0];
            paymentDateInput.value = today;
        }
        
        // Reload payments
        loadPayments(member);
    } else {
        alert('Eroare: Nu s-a putut adăuga cotizația.');
    }
}