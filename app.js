// Supabase configuration
// Función para generar hash SHA-256 (agregar al inicio de app.js)
async function hashPassword(password) {
    if (!password) return '';
    
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
const SUPABASE_URL = 'https://ugizugbplgxhawlyqztx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaXp1Z2JwbGd4aGF3bHlxenR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMTkyNjAsImV4cCI6MjA1ODY5NTI2MH0.EWkCVPmh4dYejtzd81ADMWqo4dvunKh1ay4IS4nucKU';

// DOM elements
const userTableBody = document.getElementById('userTableBody');
const userForm = document.getElementById('userForm');
const refreshBtn = document.getElementById('refreshBtn');
const loadingSpinners = document.querySelectorAll('.loading-spinner');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
   
    // Set up event listeners
    refreshBtn.addEventListener('click', loadUsers);
    userForm.addEventListener('submit', handleFormSubmit);
});

// Load users from Supabase
async function loadUsers() {
    try {
        showLoading(true);
       
        const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const users = await response.json();
        renderUserTable(users);
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Render users in the table
function renderUserTable(users) {
    userTableBody.innerHTML = '';
   
    if (users.length === 0) {
        userTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
        return;
    }
   
    users.forEach(user => {
        const row = document.createElement('tr');
       
        // Determine user type and styling
        let userType, badgeClass;
        if (user.usuario_superadministrador) {
            userType = 'Super Admin';
            badgeClass = 'bg-danger';
            row.classList.add('superadmin-card');
        } else if (user.usuario_administrador) {
            userType = 'Admin';
            badgeClass = 'bg-success';
            row.classList.add('admin-card');
        } else {
            userType = 'User';
            badgeClass = 'bg-primary';
            row.classList.add('user-card');
        }
       
        row.innerHTML = `
            <td>${user.id_usuario}</td>
            <td>${user.nombre_usuario}</td>
            <td>${user.email}</td>
            <td><span class="badge ${badgeClass} user-type-badge">${userType}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-info view-details" data-id="${user.id_usuario}">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
       
        userTableBody.appendChild(row);
    });
   
    // Add event listeners to view buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.target.closest('button').getAttribute('data-id');
            showUserDetails(users.find(u => u.id_usuario == userId));
        });
    });
}

// Handle form submission (versión modificada)
async function handleFormSubmit(e) {
    e.preventDefault();
   
    try {
        showLoading(true, 'submit');
       
        // Get form values
        const identification = document.getElementById('identification').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const userType = document.querySelector('input[name="userType"]:checked').value;
       
        // Encriptar la contraseña antes de enviarla
        const hashedPassword = await hashPassword(password);
       
        // Prepare user data with hashed password
        const userData = {
            identificacion: parseInt(identification),
            nombre_usuario: username,
            clave_encriptada: hashedPassword, // Usamos la contraseña encriptada
            email: email,
            usuario_normal: userType === 'normal' ? 1 : 0,
            usuario_administrador: userType === 'admin' ? 1 : 0,
            usuario_superadministrador: userType === 'superadmin' ? 1 : 0
        };
        // Insert user
        const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify([userData])
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const insertedUser = await response.json();
       
        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'User Added',
            text: `${username} has been successfully added.`,
            timer: 2000,
            showConfirmButton: false
        });
       
        // Reset form and refresh user list
        userForm.reset();
        loadUsers();
    } catch (error) {
        console.error('Error adding user:', error);
        showError('Failed to add user. Please try again.');
    } finally {
        showLoading(false, 'submit');
    }
}

// Show user details in modal
function showUserDetails(user) {
    const modal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
    const modalContent = document.getElementById('userDetailsContent');
   
    // Determine user type
    let userType;
    if (user.usuario_superadministrador) {
        userType = 'Super Administrator';
    } else if (user.usuario_administrador) {
        userType = 'Administrator';
    } else {
        userType = 'Normal User';
    }
   
    // Create modal content
    modalContent.innerHTML = `
        <div class="mb-3">
            <h6>ID</h6>
            <p>${user.id_usuario}</p>
        </div>
        <div class="mb-3">
            <h6>Identification</h6>
            <p>${user.identificacion}</p>
        </div>
        <div class="mb-3">
            <h6>Username</h6>
            <p>${user.nombre_usuario}</p>
        </div>
        <div class="mb-3">
            <h6>Email</h6>
            <p>${user.email}</p>
        </div>
        <div class="mb-3">
            <h6>User Type</h6>
            <p>${userType}</p>
        </div>
        <div class="mb-3">
            <h6>Account Created</h6>
            <p>${new Date().toLocaleString()}</p>
        </div>
    `;
   
    modal.show();
}

// Show loading state
function showLoading(show, element = 'all') {
    if (element === 'all') {
        loadingSpinners.forEach(spinner => {
            spinner.style.display = show ? 'inline-block' : 'none';
        });
    } else if (element === 'submit') {
        const submitText = document.getElementById('submitText');
        const submitSpinner = userForm.querySelector('.loading-spinner');
       
        submitText.style.display = show ? 'none' : 'inline-block';
        submitSpinner.style.display = show ? 'inline-block' : 'none';
        userForm.querySelector('button[type="submit"]').disabled = show;
    }
}

// Show error message
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        timer: 3000,
        showConfirmButton: false
    });
}