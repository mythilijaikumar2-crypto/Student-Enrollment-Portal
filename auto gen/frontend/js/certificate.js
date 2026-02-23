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

    // --- Config ---
    // 🔧 Change this to your production domain before deploying
    const VERIFY_BASE_URL = 'https://mydomain.com/api/certificate/verify';

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
        // certificateId is fetched from DB in production.
        // For the live preview, we use a deterministic placeholder ID
        // so the QR always shows a valid URL format.
        const previewCertId = 'CERT-PREVIEW-0001';
        generateQRCode(previewCertId);
    }

    /**
     * generateQRCode(certificateId)
     *
     * Generates a secure QR code that encodes a full HTTPS verification URL.
     * Format: https://mydomain.com/api/certificate/verify/CERTIFICATE_ID
     *
     * - Clears any previous QR instance before rendering a new one
     * - Size: 90x90 pixels
     * - Error correction: High (H) — survives partial damage/logo overlay
     * - Never embeds plain text, student names, or raw JSON
     *
     * @param {string} certificateId - The certificateId field from the database
     */
    function generateQRCode(certificateId) {
        // 1. Guard: certificateId must be a non-empty string
        if (!certificateId || typeof certificateId !== 'string' || !certificateId.trim()) {
            console.error('generateQRCode: invalid certificateId', certificateId);
            return;
        }

        // 2. Build the secure verification URL
        const verificationURL = `${VERIFY_BASE_URL}/${certificateId.trim()}`;

        // 3. Clear the previous QR (innerHTML wipe + destroy old instance)
        if (qrCodeObj) {
            qrCodeObj.clear();
            qrCodeObj = null;
        }
        qrcodeContainer.innerHTML = '';

        // 4. Guard: QRCode library must be loaded
        if (typeof QRCode === 'undefined') {
            console.error('QRCode library not loaded. Add qrcodejs via CDN.');
            qrcodeContainer.textContent = 'QR Error';
            return;
        }

        // 5. Render new QR code
        qrCodeObj = new QRCode(qrcodeContainer, {
            text: verificationURL,   // ← Only the URL, no plain text
            width: 90,               // ← 90×90 as required
            height: 90,
            colorDark: '#0F172A',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H  // High error correction
        });

        // 6. Dev log — readable confirmation of what the QR encodes
        console.log('[QR] Generated URL:', verificationURL);
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
