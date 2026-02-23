// Check auth on load
checkAuth('student');

const studentLogic = {
    // Navigate between tabs
    navigateTo: (section, event) => {
        if (event) event.preventDefault();
        window.location.search = '?section=' + section;
    },

    renderSection: (section) => {
        // Update active link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(`'${section}'`)) {
                link.classList.add('active');
            }
        });

        // Update Header Info
        const contentArea = document.getElementById('dashboardContent');
        const title = document.getElementById('pageTitle');
        const subtitle = document.getElementById('pageSubtitle');

        if (!contentArea || !title) return;

        contentArea.innerHTML = '<div class="text-center" style="padding: 100px;">Loading...</div>';

        switch (section) {
            case 'profile':
                title.textContent = 'My Profile';
                subtitle.textContent = 'Manage your account details and status';
                studentLogic.loadProfile();
                break;
            case 'progress':
                title.textContent = 'My Growth';
                subtitle.textContent = 'Track your course progress and milestones';
                studentLogic.loadProgress();
                break;
            case 'certificates':
                title.textContent = 'Certificates';
                subtitle.textContent = 'Download and verify your earned credentials';
                studentLogic.loadCertificates();
                break;
            default:
                if (section !== 'profile') {
                    studentLogic.renderSection('profile');
                }
                break;
        }
    },

    // 1. Load Profile
    loadProfile: async () => {
        const container = document.getElementById('dashboardContent');
        try {
            const profile = await apiFetch('/student/profile');

            // Update Sidebar Name
            document.getElementById('userNameDisplay').textContent = profile.name.split(' ')[0];
            document.getElementById('avatarInitials').textContent = profile.name.charAt(0);

            container.innerHTML = `
                <div class="dashboard-card" style="animation-delay: 0.1s;">
                    <div class="card-header-row">
                        <h3>Personal Information</h3>
                        <button class="btn btn-sm btn-outline">Edit</button>
                    </div>
                    <div class="profile-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
                        <div class="info-group">
                            <label style="color: var(--text-light); font-size: 0.9rem;">Full Name</label>
                            <p style="font-weight: 600; font-size: 1.1rem;">${profile.name}</p>
                        </div>
                        <div class="info-group">
                            <label style="color: var(--text-light); font-size: 0.9rem;">Email Address</label>
                            <p style="font-weight: 600; font-size: 1.1rem;">${profile.email}</p>
                        </div>
                        <div class="info-group">
                            <label style="color: var(--text-light); font-size: 0.9rem;">Student ID</label>
                            <p style="font-weight: 600; font-size: 1.1rem; font-family: monospace;">${profile.studentId}</p>
                        </div>
                         <div class="info-group">
                            <label style="color: var(--text-light); font-size: 0.9rem;">Account Type</label>
                            <span class="status-pill completed">Student</span>
                        </div>
                    </div>
                </div>


            `;
            try {
                // Fetch certificates to display on profile
                const certificates = await apiFetch('/student/certificate');

                if (certificates.length > 0) {
                    container.innerHTML += `
                        <div class="dashboard-card" style="animation-delay: 0.2s; margin-top: 2rem;">
                            <h3>My Certificates</h3>
                            <div class="certificates-list" style="margin-top: 1rem;">
                                ${certificates.map(cert => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-light); border-radius: 8px; margin-bottom: 0.8rem;">
                                        <div>
                                            <div style="font-weight: 600;">${cert.courseId.courseName}</div>
                                            <div style="font-size: 0.8rem; color: var(--text-light);">Issued: ${new Date(cert.issueDate).toLocaleDateString()}</div>
                                        </div>
                                        <a href="${cert.certificateUrl}" target="_blank" class="btn btn-sm btn-primary">Download</a>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            } catch (err) {
                console.log("Could not load certificates for profile view", err);
            }
        } catch (error) {
            container.innerHTML = `<div class="error-message show">Failed to load profile: ${error.message}</div>`;
        }
    },

    // 2. Load Progress
    loadProgress: async () => {
        const container = document.getElementById('dashboardContent');
        try {
            const enrollments = await apiFetch('/student/progress');
            // FIX: Ensure this endpoint exists in studentRoutes and returns ONLY the user's requests
            const requests = await apiFetch('/student/certificate/my-requests');

            if (enrollments.length === 0) {
                container.innerHTML = '<div class="dashboard-card text-center"><h3>No active enrollments.</h3></div>';
                return;
            }

            container.innerHTML = enrollments.map(enrollment => {
                // Find matching request for this student and this course
                const request = requests.find(r => r.courseId._id === enrollment.courseId._id);

                // Status Logic
                let status = 'In Progress';
                if (request) {
                    status = request.status; // 'pending', 'approved', or 'rejected'
                } else if (enrollment.completed) {
                    status = 'Ready to Request';
                }

                return `
    <div class="dashboard-card">
        <div class="card-header-row">
            <h3>${enrollment.courseId.courseName}</h3>
            <span class="status-pill ${status.toLowerCase().replace(/\s+/g, '-')}">${status}</span>
        </div>
        
        <div class="action-row" style="margin-top: 1.5rem;">
            ${!enrollment.completed && !request ?
                        `<button onclick="studentLogic.updateProgress('${enrollment.courseId._id}')" class="btn btn-outline btn-sm">Mark as Completed</button>` : ''
                    }

            ${(status === 'Ready to Request' || status === 'rejected') ?
                        `<button onclick="studentLogic.requestCertificate('${enrollment.courseId._id}')" class="btn btn-primary">Request Certificate</button>` : ''
                    }
        </div>
    </div>`;
            }).join('');
        } catch (error) {
            container.innerHTML = `<div class="error-message show">Failed to load progress.</div>`;
        }
    },

    // 3. Load Certificates
    loadCertificates: async () => {
        const container = document.getElementById('dashboardContent');
        try {
            const certificates = await apiFetch('/student/certificate');

            if (certificates.length === 0) {
                container.innerHTML = `
                    <div class="dashboard-card text-center" style="padding: 4rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🎓</div>
                        <h3>No Certificates Yet</h3>
                        <p>Complete a course to earn your first certificate.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = certificates.map((cert, index) => `
                <div class="dashboard-card" style="animation-delay: ${index * 0.1}s; display: flex; align-items: center; gap: 2rem;">
                    <div class="cert-icon-large" style="background: #e0e7ff; color: var(--primary); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                        🏆
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 5px;">${cert.courseId.courseName}</h3>
                        <p style="font-size: 0.9rem;">Issued on ${new Date(cert.issueDate).toLocaleDateString()}</p>
                        <div style="margin-top: 5px; font-family: monospace; background: #f1f5f9; display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">
                            ID: ${cert.certificateId}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <a href="${cert.certificateUrl}" target="_blank" class="btn btn-primary">
                            Download PDF
                        </a>
                        <div style="margin-top: 10px;">
                           <a href="http://localhost:5000/api/certificate/verify/${cert.certificateId}" target="_blank" style="font-size: 0.8rem; color: var(--text-light); text-decoration: underline;">Verify Certificate</a>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="error-message show">Failed to load certificates</div>`;
        }
    },

    // Actions
    updateProgress: async (courseId) => {
        if (!await customConfirm('Mark this course as 100% completed? (Simulation)', 'Confirm Completion')) return;
        try {
            const res = await apiFetch('/student/progress', {
                method: 'PUT',
                body: JSON.stringify({ courseId, progress: 100, completed: true }),
            });
            // Refresh view
            studentLogic.loadProgress();
        } catch (error) {
            await customAlert(error.message, 'Error');
        }
    },

    requestCertificate: async (courseId) => {
        try {
            // Optimistic UI update or loader could go here
            if (!await customConfirm('Request certificate for this course?', 'Request Certificate')) return;

            const res = await apiFetch('/student/certificate/request', {
                method: 'POST',
                body: JSON.stringify({ courseId }),
            });

            await customAlert('Certificate Requested Successfully! Check the Certificates tab.', 'Success');
            studentLogic.navigateTo('certificates');
        } catch (error) {
            await customAlert(error.message, 'Error');
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load default tab
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section') || 'profile';
    studentLogic.renderSection(section);
});
