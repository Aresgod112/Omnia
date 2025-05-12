# Integrating Supabase with Management Cotizații

Supabase is an open-source Firebase alternative that provides a PostgreSQL database, authentication, storage, and more. Here's how to integrate it with our application:

## 1. Set Up Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your Supabase URL and anon/public API key

## 2. Install Supabase Client

Add the Supabase JavaScript client to your project:

```html
<!-- Add to the head section of your HTML files -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## 3. Create Database Tables

In the Supabase dashboard, create the following tables:

### Members Table
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  id_type TEXT,
  id_series TEXT,
  id_number TEXT,
  company TEXT,
  join_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Create a Supabase Client Configuration File

Create a new file `js/supabase-config.js`:

```javascript
// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
```

## 5. Modify Authentication (auth.js)

Replace localStorage authentication with Supabase Auth:

```javascript
// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('username').value + '@example.com'; // Convert username to email format
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('loginMessage');
    
    try {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Show success message
        messageElement.textContent = 'Autentificare reușită! Redirecționare...';
        messageElement.className = 'message success';
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (error) {
        // Show error message
        messageElement.textContent = 'Nume de utilizator sau parolă incorecte!';
        messageElement.className = 'message error';
        console.error('Error signing in:', error);
    }
});

// Check if user is logged in
async function isLoggedIn() {
    const { data } = await supabase.auth.getSession();
    return data.session !== null;
}

// Get current user
async function getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
}

// Logout function
async function logout() {
    await supabase.auth.signOut();
    window.location.href = '../index.html';
}
```

## 6. Modify User Management (users.js)

Replace localStorage member management with Supabase:

```javascript
// Get Members from Supabase
async function getMembers() {
    const { data, error } = await supabase
        .from('members')
        .select('*');
    
    if (error) {
        console.error('Error fetching members:', error);
        return [];
    }
    
    return data || [];
}

// Add New Member
async function addMember() {
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
    
    // Create new member in Supabase
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
        addUserMessage.textContent = 'Eroare la adăugarea membrului!';
        addUserMessage.className = 'message error';
        return;
    }
    
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

// Delete Member
async function deleteMember(memberId) {
    if (!confirm('Sigur doriți să ștergeți acest membru?')) return;
    
    const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);
    
    if (error) {
        console.error('Error deleting member:', error);
        return;
    }
    
    // Reload members
    loadMembers();
    
    // Update dashboard stats
    updateDashboardStats();
}
```

## 7. Modify Payment Management (payments.js)

Replace localStorage payment management with Supabase:

```javascript
// Load Payments for Member
async function loadPayments(memberId) {
    if (!paymentsTableBody || !noPaymentsMessage) return;
    
    // Clear table
    paymentsTableBody.innerHTML = '';
    
    // Get payments from Supabase
    const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', memberId)
        .order('payment_date', { ascending: false });
    
    if (error) {
        console.error('Error loading payments:', error);
        noPaymentsMessage.style.display = 'block';
        return;
    }
    
    // Check if member has payments
    if (!payments || payments.length === 0) {
        noPaymentsMessage.style.display = 'block';
        return;
    } else {
        noPaymentsMessage.style.display = 'none';
    }
    
    // Populate table
    payments.forEach(payment => {
        const row = document.createElement('tr');
        
        // Format date
        const paymentDate = new Date(payment.payment_date);
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
async function addPayment() {
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
    
    // Add payment to Supabase
    const { error } = await supabase
        .from('payments')
        .insert([
            {
                member_id: memberId,
                amount,
                payment_date: date,
                notes
            }
        ]);
    
    if (error) {
        console.error('Error adding payment:', error);
        alert('Eroare: Nu s-a putut adăuga cotizația.');
        return;
    }
    
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
    loadPayments(memberId);
}
```

## 8. Update Dashboard Stats

Modify the dashboard stats to use Supabase:

```javascript
// Update dashboard stats
async function updateDashboardStats() {
    // Get total members count
    const { count: membersCount, error: membersError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
    
    if (membersError) {
        console.error('Error counting members:', membersError);
        return;
    }
    
    // Update total members
    const totalMembersElement = document.getElementById('totalMembers');
    if (totalMembersElement) {
        totalMembersElement.textContent = membersCount || 0;
    }
    
    // Calculate total payments
    const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount');
    
    if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        return;
    }
    
    let totalPayments = 0;
    if (payments) {
        payments.forEach(payment => {
            totalPayments += parseFloat(payment.amount);
        });
    }
    
    // Update total payments
    const totalPaymentsElement = document.getElementById('totalPayments');
    if (totalPaymentsElement) {
        totalPaymentsElement.textContent = totalPayments + ' RON';
    }
}
```

## 9. Initial Setup

You'll need to create the admin user in Supabase Auth:

1. Go to Authentication > Users in the Supabase dashboard
2. Click "Add User"
3. Enter email (e.g., admin@example.com) and password
4. Or enable "Email Auth" and implement a sign-up page

## Benefits of Using Supabase

1. **Data Persistence**: Data is stored in the cloud, not in the browser
2. **Multi-device Access**: Access your data from any device
3. **Security**: Proper authentication and authorization
4. **Scalability**: PostgreSQL database can handle large amounts of data
5. **Realtime Updates**: Subscribe to database changes for real-time updates
6. **Backup & Recovery**: Data is backed up and can be restored

## Additional Features You Could Implement

1. **Row-level Security**: Control who can access which data
2. **Storage**: Store files like profile pictures or documents
3. **Functions**: Run server-side code for complex operations
4. **Realtime**: Implement real-time updates when data changes
5. **Multi-user Support**: Allow multiple users with different roles