document.addEventListener('DOMContentLoaded', function() {
    // Common elements
    const alertContainer = document.getElementById('alert-container');
    
    // Show alert function
    function showAlert(message, type = 'success') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show alert-notification`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to body if no container found
        const targetContainer = alertContainer || document.body;
        targetContainer.appendChild(alert);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    // Toggle password visibility
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
    
    // Set up all password toggles
    setupPasswordToggle('togglePassword', 'password');
    setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');
    setupPasswordToggle('toggleCurrentPassword', 'currentPassword');
    setupPasswordToggle('toggleNewPassword', 'newPassword');
    setupPasswordToggle('toggleConfirmNewPassword', 'confirmNewPassword');
    
    // Sign Up Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Simple validation
            if (password !== confirmPassword) {
                showAlert('Passwords do not match!', 'danger');
                return;
            }
            
            try {
                // In a real app, you would call your backend API here
                // For demo, we'll simulate an API call
                const response = await simulateApiCall({
                    endpoint: '/api/signup',
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
                            // Verify OTP with backend
                            const verifyResponse = await simulateApiCall({
                                endpoint: '/api/verify-otp',
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
                                showAlert('Invalid OTP. Please try again.', 'danger');
                            }
                        } catch (error) {
                            showAlert('Error verifying OTP. Please try again.', 'danger');
                        }
                    });
                } else {
                    showAlert(response.message || 'Signup failed. Please try again.', 'danger');
                }
            } catch (error) {
                showAlert('An error occurred. Please try again.', 'danger');
            }
        });
    }
    
    // Sign In Form
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            try {
                // In a real app, you would call your backend API here
                const response = await simulateApiCall({
                    endpoint: '/api/signin',
                    method: 'POST',
                    body: { email, password, rememberMe }
                });
                
                if (response.success) {
                    showAlert('Login successful!', 'success');
                    // Store user data in localStorage
                    localStorage.setItem('user', JSON.stringify(response.user));
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    showAlert(response.message || 'Invalid email or password', 'danger');
                }
            } catch (error) {
                showAlert('An error occurred. Please try again.', 'danger');
            }
        });
    }
    
    // Forgot Password Link
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
            modal.show();
        });
    }
    
    // Forgot Password Form
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value;
            
            try {
                // Send reset code to email
                const response = await simulateApiCall({
                    endpoint: '/api/forgot-password',
                    method: 'POST',
                    body: { email }
                });
                
                if (response.success) {
                    showAlert('Password reset code sent to your email', 'success');
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                    modal.hide();
                } else {
                    showAlert(response.message || 'Failed to send reset code', 'danger');
                }
            } catch (error) {
                showAlert('An error occurred. Please try again.', 'danger');
            }
        });
    }
    
    // Change Password Form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            
            // Validation
            if (newPassword !== confirmNewPassword) {
                showAlert('New passwords do not match!', 'danger');
                return;
            }
            
            try {
                // Get user from localStorage
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) {
                    showAlert('Please sign in again', 'danger');
                    return;
                }
                
                // Call API to change password
                const response = await simulateApiCall({
                    endpoint: '/api/change-password',
                    method: 'POST',
                    body: { 
                        userId: user.id, 
                        currentPassword, 
                        newPassword 
                    }
                });
                
                if (response.success) {
                    showAlert('Password changed successfully!', 'success');
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                    modal.hide();
                } else {
                    showAlert(response.message || 'Failed to change password', 'danger');
                }
            } catch (error) {
                showAlert('An error occurred. Please try again.', 'danger');
            }
        });
    }
    
    // Logout
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('user');
            showAlert('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 1500);
        });
    }
    
    // Dashboard - Load user data
    if (window.location.pathname.includes('dashboard.html')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'signin.html';
            return;
        }
        
        // Display user info
        document.getElementById('userName').textContent = user.name;
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        
        // Generate initials for profile icon if no image
        if (!user.image) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            document.getElementById('profileIcon').className = 'fas fa-user-circle fa-5x text-primary';
            document.getElementById('userIcon').innerHTML = `<i class="fas fa-user-circle"></i>`;
        }
    }
    
    // Simulate API call (replace with actual fetch calls to your backend)
    async function simulateApiCall({ endpoint, method, body }) {
        console.log(`API Call: ${method} ${endpoint}`, body);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock responses
        if (endpoint === '/api/signup') {
            return {
                success: true,
                message: 'OTP sent to your email'
            };
        }
        
        if (endpoint === '/api/verify-otp') {
            if (body.otp === '123456') { // Mock valid OTP
                return {
                    success: true,
                    user: {
                        id: 'user123',
                        name: body.name || 'Test User',
                        email: body.email
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Invalid OTP'
                };
            }
        }
        
        if (endpoint === '/api/signin') {
            if (body.password === 'password123') { // Mock valid password
                return {
                    success: true,
                    user: {
                        id: 'user123',
                        name: 'Test User',
                        email: body.email
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Invalid credentials'
                };
            }
        }
        
        if (endpoint === '/api/forgot-password') {
            return {
                success: true,
                message: 'Reset code sent'
            };
        }
        
        if (endpoint === '/api/change-password') {
            if (body.currentPassword === 'password123') { // Mock valid current password
                return {
                    success: true,
                    message: 'Password changed'
                };
            } else {
                return {
                    success: false,
                    message: 'Current password is incorrect'
                };
            }
        }
        
        // Default response
        return {
            success: false,
            message: 'Endpoint not implemented'
        };
    }
});