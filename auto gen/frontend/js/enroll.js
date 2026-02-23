// using global apiFetch from app.js
// Since existing app.js is not a module, we will assume global scope or adjust.
// Looking at app.js, it defines globals. I will write this as a standard script that assumes app.js is loaded before it.

// Define globally for HTML access
window.enrollLogic = {
    sendOtp: async (type) => {
        const inputId = type === 'email' ? 'email' : 'mobileNumber';
        const value = document.getElementById(inputId).value;

        if (!value) {
            alert(`Please enter your ${type} first.`);
            return;
        }

        const btnId = type === 'email' ? 'btnVerifyEmail' : 'btnVerifyMobile';

        try {
            const btn = document.getElementById(btnId);
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            await apiFetch('/auth/send-otp', {
                method: 'POST',
                body: JSON.stringify({ identifier: value, type })
            });

            // Show OTP Input
            document.getElementById(`${type}OtpGroup`).classList.remove('hidden');
            btn.textContent = 'Resend';
            btn.disabled = false;

            // Focus OTP input
            document.getElementById(`${type}Otp`).focus();

        } catch (error) {
            alert(error.message);
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.textContent = 'Verify';
                btn.disabled = false;
            }
        }
    },

    verifyOtp: async (type) => {
        const inputId = type === 'email' ? 'email' : 'mobileNumber';
        const identifier = document.getElementById(inputId).value;
        const code = document.getElementById(`${type}Otp`).value;

        if (!code) return;

        const btnId = type === 'email' ? 'btnSubmitEmailOtp' : 'btnSubmitMobileOtp';
        const verifyBtnId = type === 'email' ? 'btnVerifyEmail' : 'btnVerifyMobile';

        try {
            const btn = document.getElementById(btnId);
            btn.disabled = true;

            await apiFetch('/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ identifier, type, code })
            });

            // Success UI
            document.getElementById(`${type}Verified`).classList.remove('hidden');
            document.getElementById(`${type}OtpGroup`).classList.add('hidden');

            const verifyBtn = document.getElementById(verifyBtnId);
            if (verifyBtn) verifyBtn.style.display = 'none';

            document.getElementById(inputId).readOnly = true;
            document.getElementById(inputId).classList.add('verified-input');

            // Mark as verified in state (optional, or rely on DOM)
            enrollLogic.state[type] = true;

        } catch (error) {
            alert(error.message);
            const btn = document.getElementById(btnId);
            if (btn) btn.disabled = false;
        }
    },

    state: {
        email: false,
        mobile: false
    }
};

const enrollInit = () => {
    const enrollForm = document.getElementById('enrollForm');
    const courseSelect = document.getElementById('courseId');
    const submitBtn = enrollForm.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('successMessage');
    const formContent = document.getElementById('formContent');

    // Floating label logic
    const inputs = document.querySelectorAll('.form-group input, .form-group select');
    inputs.forEach(input => {
        // Init state
        if (input.value) input.classList.add('has-value');

        input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            if (input.value) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
        input.addEventListener('change', () => {
            if (input.value) input.classList.add('has-value');
        });
    });

    // Event Listeners for OTP Buttons (CSP Fix)
    document.getElementById('btnVerifyEmail').addEventListener('click', () => enrollLogic.sendOtp('email'));
    document.getElementById('btnVerifyMobile').addEventListener('click', () => enrollLogic.sendOtp('mobile'));
    document.getElementById('btnSubmitEmailOtp').addEventListener('click', () => enrollLogic.verifyOtp('email'));
    document.getElementById('btnSubmitMobileOtp').addEventListener('click', () => enrollLogic.verifyOtp('mobile'));

    // Load courses
    const loadCourses = async () => {
        try {
            // Using global apiFetch from app.js
            const courses = await apiFetch('/courses');
            courseSelect.innerHTML = '<option value="" disabled selected></option>'; // Empty for floating label
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course._id;
                option.textContent = `${course.courseName} (${course.duration})`;
                courseSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load courses', error);
            courseSelect.innerHTML = '<option value="">Error loading courses</option>';
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();

        // Check verification first
        if (!enrollLogic.state.email) {
            showCustomError("Please verify your Email Address first.");
            return;
        }
        if (!enrollLogic.state.mobile) {
            showCustomError("Please verify your Mobile Number first.");
            return;
        }

        // Visual Loading State
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loader"></span> Enrolling...';
        submitBtn.classList.add('loading');

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const mobileNumber = document.getElementById('mobileNumber').value;
        const courseId = document.getElementById('courseId').value;

        try {
            const data = await apiFetch('/auth/student/enroll', {
                method: 'POST',
                body: JSON.stringify({ name, email, mobileNumber, courseId }),
            });

            // Success Animation
            formContent.style.opacity = '0';
            formContent.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                formContent.style.display = 'none';
                successMessage.classList.remove('hidden');
                // Trigger reflow
                void successMessage.offsetWidth;
                successMessage.classList.add('visible');

                // Populate credentials
                document.getElementById('newStudentId').textContent = data.studentId;
                document.getElementById('newPassword').textContent = data.password;
            }, 300);

        } catch (error) {
            // Use custom center alert instead of native alert
            showCustomError(error.message);

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            submitBtn.classList.remove('loading');
        }
    };

    // Helper for Custom Alert
    const showCustomError = (message) => {
        // Remove existing if any
        const existing = document.querySelector('.center-alert');
        if (existing) existing.remove();
        const existingOverlay = document.querySelector('.overlay-backdrop');
        if (existingOverlay) existingOverlay.remove();

        // Create Overlay
        const overlay = document.createElement('div');
        overlay.className = 'overlay-backdrop';
        document.body.appendChild(overlay);

        // Create Alert
        const alertBox = document.createElement('div');
        alertBox.className = 'center-alert';
        alertBox.innerHTML = `
            <div class="center-alert-icon">!</div>
            <h3>Enrollment Error</h3>
            <p>${message}</p>
            <button id="btnCloseCustomError" class="btn-fluid" style="margin-top: 0; padding: 12px;">
                Okay, I understand
            </button>
        `;
        document.body.appendChild(alertBox);

        // Animate In
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
            alertBox.classList.add('visible');
        });

        // Close function
        const closeCustomError = () => {
            overlay.classList.remove('visible');
            alertBox.classList.remove('visible');
            setTimeout(() => {
                overlay.remove();
                alertBox.remove();
            }, 300);
        };

        // Attach Listener
        document.getElementById('btnCloseCustomError').addEventListener('click', closeCustomError);
    };

    loadCourses();
    enrollForm.addEventListener('submit', handleEnroll);
};

document.addEventListener('DOMContentLoaded', enrollInit);
