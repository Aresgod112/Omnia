// Data Manager - Handles import/export of application data

document.addEventListener('DOMContentLoaded', function() {
    // Export Data Button
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
    
    // Import Data File Input
    const importDataFile = document.getElementById('importDataFile');
    if (importDataFile) {
        importDataFile.addEventListener('change', importData);
    }
});

/**
 * Export all application data to a JSON file
 */
function exportData() {
    // Collect all data from localStorage
    const data = {
        members: JSON.parse(localStorage.getItem('members') || '[]'),
        timestamp: new Date().toISOString()
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger click
    const a = document.createElement('a');
    a.href = url;
    a.download = `cotizatii-export-${formatDateForFilename(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    showDataMessage('Date exportate cu succes!', 'success');
}

/**
 * Import data from a JSON file
 */
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            // Parse the JSON data
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!data.members || !Array.isArray(data.members)) {
                throw new Error('Format de date invalid');
            }
            
            // Import members
            localStorage.setItem('members', JSON.stringify(data.members));
            
            // Show success message
            showDataMessage('Date importate cu succes! Se reîncarcă pagina...', 'success');
            
            // Reload the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
            
        } catch (error) {
            console.error('Error importing data:', error);
            showDataMessage('Eroare la importarea datelor: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        showDataMessage('Eroare la citirea fișierului', 'error');
    };
    
    reader.readAsText(file);
    
    // Reset the file input
    event.target.value = '';
}

/**
 * Show a message in the data message element
 */
function showDataMessage(message, type) {
    const dataMessage = document.getElementById('dataMessage');
    if (dataMessage) {
        dataMessage.textContent = message;
        dataMessage.className = `message ${type}`;
        
        // Clear message after 5 seconds
        setTimeout(() => {
            dataMessage.textContent = '';
            dataMessage.className = 'message';
        }, 5000);
    }
}

/**
 * Format date for filename (YYYY-MM-DD)
 */
function formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}