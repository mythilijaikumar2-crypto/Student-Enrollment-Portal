document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const studentNameInput = document.getElementById('studentName');
    const courseNameInput = document.getElementById('courseName');
    const issueDateInput = document.getElementById('issueDate');
    const downloadBtn = document.getElementById('downloadBtn');

    const displayStudentName = document.getElementById('displayStudentName');
    const displayCourseName = document.getElementById('displayCourseName');
    const displayDate = document.getElementById('displayDate');
    const qrcodeContainer = document.getElementById('qrcode');

    // --- State ---
    let qrCodeObj = null;

    // --- Initialization ---
    function init() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        issueDateInput.value = today;

        // Initial render
        updatePreview();
    }

    // --- Core Functions ---

    function updatePreview() {
        // Update Text
        const name = studentNameInput.value || 'Student Name';
        const course = courseNameInput.value || 'Course Name';
        const dateRaw = issueDateInput.value;

        // Format Date (e.g., December 24, 2025)
        const dateObj = dateRaw ? new Date(dateRaw) : new Date();
        const dateFormatted = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Apply to DOM
        displayStudentName.textContent = name;
        displayCourseName.textContent = course;
        displayDate.textContent = dateFormatted;

        // Update QR Code
        generateQRCode(name, course, dateRaw);
    }

    function generateQRCode(name, course, date) {
        // Clear previous QR
        qrcodeContainer.innerHTML = '';

        // Verification Data (simulation)
        const verificationData = JSON.stringify({
            id: 'CERT-' + Math.floor(Math.random() * 10000),
            student: name,
            course: course,
            issued: date,
            issuer: 'NXT SYNC Network'
        });

        // Generate new QR
        // using qrcodejs library
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrcodeContainer, {
                text: verificationData,
                width: 80,
                height: 80,
                colorDark: "#0F172A",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            console.warn('QRCode library not loaded');
            qrcodeContainer.textContent = 'QR Err';
        }
    }

    async function generatePDF() {
        const element = document.getElementById('certificate');
        const name = studentNameInput.value || 'Student';
        const filename = `Certificate_${name.replace(/[^a-z0-9]/gi, '_')}.pdf`;

        // Button state
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = 'Generating...';
        downloadBtn.disabled = true;

        // Options for high quality
        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 4, // HD Quality
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: {
                unit: 'px',
                format: [950, 650],
                orientation: 'landscape',
                compress: true
            }
        };

        try {
            // Wait for html2pdf
            if (typeof html2pdf !== 'undefined') {
                await html2pdf().set(opt).from(element).save();
            } else {
                alert('PDF generation library not loaded.');
            }
        } catch (err) {
            console.error('PDF Generation Error:', err);
            alert('Failed to generate PDF. See console.');
        } finally {
            // Reset button
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    }

    // --- Event Listeners ---

    // Real-time updates on input
    const inputs = [studentNameInput, courseNameInput, issueDateInput];
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Download Action
    downloadBtn.addEventListener('click', generatePDF);

    // Run Init
    init();
});
