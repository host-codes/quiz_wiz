document.addEventListener('DOMContentLoaded', function() {
    // API Base URL
    const API_BASE_URL = "https://quiz-wiz-kaqu.onrender.com";
    
    // Common elements
    const alertContainer = document.getElementById('alert-container');
    
    // ========================
    // Helper Functions
    // ========================
    
    // Show alert notification
    function showAlert(message, type = 'success') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show alert-notification`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const targetContainer = alertContainer || document.body;
        targetContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    // API Call Function (replaces simulateApiCall)
    async function makeApiCall({ endpoint, method, body }) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add auth token if available
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }
    
    // Password visibility toggle
    function setupPasswordToggle(buttonId, inputId) {
        const toggleButton = document.getElementById(buttonId);
        const passwordInput = document.getElementById(inputId);
        
        if (toggleButton && passwordInput) {
            toggleButton.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.querySelector('i').classList.toggle('fa-eye-slash');
                this.querySelector('i').classList.toggle('fa-eye');
            });
        }
    }
    
    // Initialize all password toggles
    setupPasswordToggle('togglePassword', 'password');
    setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');
    setupPasswordToggle('toggleCurrentPassword', 'currentPassword');
    setupPasswordToggle('toggleNewPassword', 'newPassword');
    setupPasswordToggle('toggleConfirmNewPassword', 'confirmNewPassword');
    
    // ========================
    // Sign Up Functionality
    // ========================
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showAlert('Passwords do not match!', 'danger');
                return;
            }
            
            try {
                const response = await makeApiCall({
                    endpoint: '/api/auth/signup',
                    method: 'POST',
                    body: { name, email, password }
                });
                
                if (response.success) {
                    // Show OTP modal
                    const otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
                    otpModal.show();
                    
                    // Handle OTP verification
                    document.getElementById('verifyOtp').addEventListener('click', async function() {
                        const otp = document.getElementById('otp').value;
                        
                        if (otp.length !== 6) {
                            showAlert('Please enter a valid 6-digit OTP', 'danger');
                            return;
                        }
                        
                        try {
                            const verifyResponse = await makeApiCall({
                                endpoint: '/api/auth/verify-otp',
                                method: 'POST',
                                body: { email, otp }
                            });
                            
                            if (verifyResponse.success) {
                                showAlert('Account created successfully!', 'success');
                                otpModal.hide();
                                setTimeout(() => {
                                    window.location.href = 'signin.html';
                                }, 1500);
                            } else {
                                showAlert(verifyResponse.message || 'Invalid OTP', 'danger');
                            }
                        } catch (error) {
                            showAlert('Error verifying OTP. Please try again.', 'danger');
                        }
                    });
                } else {
                    showAlert(response.message || 'Signup failed', 'danger');
                }
            } catch (error) {
                showAlert(error.message || 'An error occurred during signup', 'danger');
            }
        });
    }
    
    // ========================
    // Sign In Functionality
    // ========================
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            try {
                const response = await makeApiCall({
                    endpoint: '/api/auth/signin',
                    method: 'POST',
                    body: { email, password, rememberMe }
                });
                
                if (response.success) {
                    showAlert('Login successful!', 'success');
                    // Store user data with token
                    localStorage.setItem('user', JSON.stringify({
                        id: response.user.id,
                        name: response.user.name,
                        email: response.user.email,
                        token: response.token
                    }));
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    showAlert(response.message || 'Invalid email or password', 'danger');
                }
            } catch (error) {
                showAlert(error.message || 'Login failed. Please try again.', 'danger');
            }
        });
    }
    
    // ========================
    // Forgot Password
    // ========================
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            new bootstrap.Modal(document.getElementById('forgotPasswordModal')).show();
        });
    }
    
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value;
            
            try {
                const response = await makeApiCall({
                    endpoint: '/api/auth/forgot-password',
                    method: 'POST',
                    body: { email }
                });
                
                if (response.success) {
                    showAlert('Password reset instructions sent to your email', 'success');
                    bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal')).hide();
                } else {
                    showAlert(response.message || 'Failed to send reset instructions', 'danger');
                }
            } catch (error) {
                showAlert(error.message || 'Failed to process request', 'danger');
            }
        });
    }
    
    // ========================
    // Dashboard Functionality
    // ========================
    if (window.location.pathname.includes('dashboard.html')) {
        // Load user data
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'signin.html';
            return;
        }
        
        // Display user info
        document.getElementById('userName').textContent = user.name;
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        
        // Generate initials for profile icon
        if (!user.image) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            document.getElementById('profileIcon').className = 'fas fa-user-circle fa-5x text-primary';
            document.getElementById('userIcon').innerHTML = `<i class="fas fa-user-circle"></i>`;
        }
        
        // Change Password
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;
                
                if (newPassword !== confirmNewPassword) {
                    showAlert('New passwords do not match!', 'danger');
                    return;
                }
                
                try {
                    const response = await makeApiCall({
                        endpoint: '/api/auth/change-password',
                        method: 'POST',
                        body: { 
                            userId: user.id, 
                            currentPassword, 
                            newPassword 
                        }
                    });
                    
                    if (response.success) {
                        showAlert('Password changed successfully!', 'success');
                        bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
                    } else {
                        showAlert(response.message || 'Password change failed', 'danger');
                    }
                } catch (error) {
                    showAlert(error.message || 'Failed to change password', 'danger');
                }
            });
        }
        
        // Logout
        document.getElementById('logout').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('user');
            showAlert('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 1500);
        });
    }
});
