// Check auth on load
checkAuth('admin');

const adminLogic = {
    navigateTo: (section, event) => {
        if (event) event.preventDefault();
        window.location.search = '?section=' + section;
    },

    renderSection: (section) => {
        // Clear any existing polling when switching sections
        if (window.currentPoll) {
            clearTimeout(window.currentPoll);
            window.currentPoll = null;
        }

        // Update active link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            // Check if onclick contains the section name
            if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(`'${section}'`)) {
                link.classList.add('active');
            }
        });

        // Update Header
        const title = document.getElementById('pageTitle');
        const subtitle = document.getElementById('pageSubtitle');
        const container = document.getElementById('dashboardContent');

        if (!title || !container) return; // Safety check

        container.innerHTML = '<div class="text-center" style="padding: 100px;">Loading...</div>';

        switch (section) {
            case 'overview':
                title.textContent = 'Dashboard Overview';
                subtitle.textContent = 'Welcome back, Admin';
                adminLogic.loadOverview();
                break;
            case 'courses':
                title.textContent = 'Course Management';
                subtitle.textContent = 'Create and manage courses';
                adminLogic.loadCourses();
                break;
            case 'students':
                title.textContent = 'Student Registry';
                subtitle.textContent = 'View all enrolled students';
                adminLogic.loadStudents();
                break;
            case 'requests':
                title.textContent = 'Certificate Requests';
                subtitle.textContent = 'Approve pending certificate requests';
                adminLogic.loadRequests();
                break;
            default:
                // Fallback to overview if unknown section
                if (section !== 'overview') {
                    adminLogic.renderSection('overview');
                }
                break;
        }
    },

    // 1. Overview
    loadOverview: async () => {
        const container = document.getElementById('dashboardContent');
        // Only show loading spinner on initial load, not on updates
        if (!document.getElementById('overview-view')) {
           // container.innerHTML = '<div class="text-center" style="padding: 100px;">Loading...</div>'; 
           // Handled by renderSection, but we can verify
        }

        try {
            const data = await apiFetch('/admin/overview');

            const contentHTML = `
                <div id="overview-view" class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                    <div class="dashboard-card stat-card">
                        <h3>Total Students</h3>
                        <div class="stat-value">${data.studentCount}</div>
                    </div>
                    <div class="dashboard-card stat-card">
                        <h3>Active Courses</h3>
                        <div class="stat-value">${data.courseCount}</div>
                    </div>
                    <div class="dashboard-card stat-card" onclick="adminLogic.navigateTo('requests')" style="cursor: pointer; transition: transform 0.2s;" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
                        <h3>Pending Requests</h3>
                        <div class="stat-value" style="color: ${data.pendingRequests > 0 ? '#ef4444' : 'inherit'}">${data.pendingRequests}</div>
                        <small style="color: var(--text-light); font-size: 0.8rem;">Click to review</small>
                    </div>
                    <div class="dashboard-card stat-card">
                        <h3>Issued Certificates</h3>
                        <div class="stat-value" style="color: #10b981;">${data.issuedCertificates}</div>
                    </div>
                </div>

                <div class="dashboard-card mt-4">
                    <h3>Quick Actions</h3>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button onclick="adminLogic.navigateTo('courses')" class="btn btn-primary">Add New Course</button>
                        <button onclick="adminLogic.navigateTo('requests')" class="btn btn-outline">Review Requests</button>
                    </div>
                </div>
            `;
            
            // If fetching again (polling), we want to update the values smoothly if possible, but full replace is fine for now
            container.innerHTML = contentHTML;

            // Real-time Poll for Overview
            window.currentPoll = setTimeout(() => {
                // Check if we are still on the overview page
                if (document.getElementById('overview-view')) {
                   adminLogic.loadOverview();
                }
            }, 5000); // 5 second update cycle

        } catch (error) {
            container.innerHTML = `<div class="error-message show">Error loading overview: ${error.message}</div>`;
        }
    },

    // 2. Courses
    loadCourses: async () => {
        const container = document.getElementById('dashboardContent');
        try {
            const courses = await apiFetch('/courses');

            let html = `
                <div class="action-bar" style="margin-bottom: 2rem; display: flex; justify-content: flex-end;">
                    <button onclick="adminLogic.openModal('courseModal')" class="btn btn-primary">+ Create Course</button>
                </div>
                <div class="dashboard-card">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Duration</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            if (courses.length === 0) {
                html += `<tr><td colspan="4" class="text-center">No courses found.</td></tr>`;
            } else {
                html += courses.map(course => `
                    <tr>
                        <td><strong>${course.courseCode}</strong></td>
                        <td>${course.courseName}</td>
                        <td>${course.duration}</td>
                        <td>${new Date(course.createdAt).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            }

            html += `</tbody></table></div>`;
            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = `<div class="error-message show">Error loading courses: ${error.message}</div>`;
        }
    },

    createCourse: async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Creating...';

        const courseData = {
            courseName: document.getElementById('cName').value,
            courseCode: document.getElementById('cCode').value,
            duration: document.getElementById('cDuration').value,
            description: document.getElementById('cDesc').value
        };

        try {
            await apiFetch('/admin/course', {
                method: 'POST',
                body: JSON.stringify(courseData)
            });

            adminLogic.closeModal('courseModal');
            e.target.reset();
            alert('Course created successfully!');
            adminLogic.loadCourses(); // Refresh list
        } catch (error) {
            alert(error.message);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    // 3. Students
    loadStudents: async () => {
        const container = document.getElementById('dashboardContent');
        try {
            const students = await apiFetch('/admin/students');

            let html = `
                <div class="dashboard-card">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            if (students.length === 0) {
                html += `<tr><td colspan="4" class="text-center">No students registered yet.</td></tr>`;
            } else {
                html += students.map(student => `
                    <tr>
                        <td style="font-family: monospace;">${student.studentId || '-'}</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="user-avatar" style="width: 30px; height: 30px; font-size: 0.8rem;">${student.name.charAt(0)}</div>
                                ${student.name}
                            </div>
                        </td>
                        <td>${student.email}</td>
                        <td>${new Date(student.createdAt).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            }

            html += `</tbody></table></div>`;
            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = `<div class="error-message show">Error loading students: ${error.message}</div>`;
        }
    },

    // 4. Requests
    // ... existing navigateTo and other methods ...

    loadRequests: async () => {
        const container = document.getElementById('dashboardContent');
        try {
            const requests = await apiFetch('/admin/certificate/requests');

            // process all requests, do not filter out broken ones silently
            const pendingRequests = requests.filter(r => r.status === 'pending');
            const historyRequests = requests.filter(r => r.status !== 'pending');

            let html = `<div id="requests-view">
            <h3>Pending Requests (${pendingRequests.length})</h3>
            <div class="dashboard-card mb-4">
                <table class="data-table">
                    <thead><tr><th>Student Name</th><th>Course</th><th>Action</th></tr></thead>
                    <tbody>`;

            if (pendingRequests.length === 0) {
                html += `<tr><td colspan="3" class="text-center" style="padding: 2rem; color: var(--text-light);">No pending requests found.</td></tr>`;
            } else {
                html += pendingRequests.map(req => `
                <tr>
                    <td>
                        <div style="font-weight: 600;">${req.studentId?.name || 'Unknown Student'}</div>
                        <div style="font-size: 0.8rem; color: var(--text-light);">${req.studentId?.studentId || 'N/A'}</div>
                    </td>
                    <td>${req.courseId?.courseName || 'Unknown Course'}</td>
                    <td>
                        <button onclick="adminLogic.approveRequest('${req._id}')" class="btn btn-primary btn-sm" ${!req.studentId || !req.courseId ? 'disabled' : ''}>Approve</button>
                        <button onclick="adminLogic.rejectRequest('${req._id}')" class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #ef4444;">Reject</button>
                    </td>
                </tr>
            `).join('');
            }
            html += `</tbody></table></div>`;

            // History Table
            html += `<h3 class="mt-4">Process History</h3>
            <div class="dashboard-card"><table class="data-table">
            <thead><tr><th>Student</th><th>Course</th><th>Result</th></tr></thead><tbody>`;

            if (historyRequests.length === 0) {
                html += `<tr><td colspan="3" class="text-center">No history yet.</td></tr>`;
            } else {
                html += historyRequests.map(req => `
                <tr>
                    <td>${req.studentId?.name || 'Unknown Student'}</td>
                    <td>${req.courseId?.courseName || 'Unknown Course'}</td>
                    <td><span class="status-pill ${req.status}">${req.status.toUpperCase()}</span></td>
                </tr>
            `).join('');
            }
            html += `</tbody></table></div></div>`;

            container.innerHTML = html;

            // Simple Real-time Polling
            window.currentPoll = setTimeout(() => {
                // Only reload if the requests view is still active in the DOM
                if (document.getElementById('requests-view')) {
                    adminLogic.loadRequests();
                }
            }, 5000);

        } catch (error) {
            console.error("Admin Request Load Error:", error);
            container.innerHTML = `<div class="error-message show">System Error: Unable to fetch certificate requests.</div>`;
        }
    },

    rejectRequest: async (requestId) => {
        const reason = prompt("Enter reason for rejection:");
        if (!reason) return;
        try {
            await apiFetch('/admin/certificate/reject', {
                method: 'POST',
                body: JSON.stringify({ requestId, reason })
            });
            await customAlert('Request Rejected', 'Success');
            adminLogic.loadRequests();
        } catch (error) {
            await customAlert(error.message, 'Error');
        }
    },
    // ... approveRequest as you have it ...
    approveRequest: async (requestId) => {
        if (!await customConfirm('Approve and email certificate?', 'Confirm Approval')) return;
        try {
            await apiFetch('/admin/certificate/approve', { method: 'POST', body: JSON.stringify({ requestId }) });
            await customAlert('Approved and Emailed!', 'Success');
            adminLogic.loadRequests();
        } catch (error) { await customAlert(error.message, 'Error'); }
    }
};
// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section') || 'overview';
    adminLogic.renderSection(section);

    // Form Listener
    document.getElementById('createCourseForm').addEventListener('submit', adminLogic.createCourse);

    // Close modal on outside click
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    }
});
