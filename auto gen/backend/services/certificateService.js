const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const generateCertificate = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
                margin: 0 // Remove default margins for sidebar placement
            });

            const fileName = `CERT-${data.certificateId}.pdf`;
            const folderPath = path.join(__dirname, '../public/certificates');
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

            const filePath = path.join(folderPath, fileName);
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // 1. SIDEBAR (Dark Blue)
            doc.rect(0, 0, 260, 595.28).fill('#1a237e');

            // 2. LOGO CONTAINER (White Rounded Card in Sidebar)
            doc.roundedRect(35, 50, 190, 120, 10).fill('#ffffff');

            const logoPath = path.join(__dirname, '../../frontend/assets/logo.jpg');
            if (fs.existsSync(logoPath)) {
                // Center logo in the white box
                doc.image(logoPath, 55, 70, { width: 150 });
            }

            // 3. MAIN CONTENT (Left Aligned)
            const marginLeft = 300;

            // ISO Pill (Top Left of Content)
            doc.roundedRect(marginLeft, 60, 160, 25, 4).fill('#f1f5f9');
            doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('An ISO Certified Company', marginLeft, 68, { width: 160, align: 'center' });

            // Badges (Top Right)
            const badgesStart = 680;
            const aictePath = path.join(__dirname, '../../frontend/assets/AICTE.webp');
            const isoBadgePath = path.join(__dirname, '../../frontend/assets/ISO1.png');

            try {
                if (fs.existsSync(isoBadgePath)) {
                    doc.image(isoBadgePath, badgesStart, 50, { width: 50 });
                }
                if (fs.existsSync(aictePath)) {
                    doc.image(aictePath, badgesStart + 70, 50, { width: 50 });
                }
            } catch (e) {
                console.error("Badge image rendering error (possibly unsupported format):", e.message);
            }

            // Main Heading
            doc.moveDown();
            doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(42).text('Certificate of', marginLeft, 140);
            doc.text('Completion', marginLeft, 185);

            // "This is to certify that"
            doc.fillColor('#64748b').font('Helvetica').fontSize(16).text('This is to certify that', marginLeft, 240);

            // STUDENT NAME
            doc.fillColor('#0f172a').font('Times-Bold').fontSize(35).text(data.studentName.toUpperCase(), marginLeft, 275);

            // Intro to Course
            doc.fillColor('#64748b').font('Helvetica').fontSize(16).text('has successfully completed all the modules of', marginLeft, 330);

            // COURSE NAME
            doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(24).text(data.courseName, marginLeft, 360);

            // Date
            doc.fillColor('#64748b').font('Helvetica').fontSize(14).text(`Issued on ${new Date(data.date).toISOString().split('T')[0]}`, marginLeft, 410);

            // 4. FOOTER
            const footerY = 500;

            // Authorized Signatory (Left)
            // Stroke line
            doc.save();
            doc.strokeColor('#0f172a').lineWidth(1).moveTo(marginLeft, footerY).lineTo(marginLeft + 200, footerY).stroke();
            doc.restore();

            doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(14).text('Authorized Signatory', marginLeft, footerY + 10);
            doc.fillColor('#64748b').font('Helvetica').fontSize(11).text('NXT SYNC Network', marginLeft, footerY + 30);

            // GENERATE QR CODE
            const qrX = 700;
            const qrY = 460;
            const qrSize = 90;

            try {
                // Encode the verification URL
                const verifyUrl = `http://localhost:5000/api/certificate/verify/${data.certificateId}`;
                const qrOptions = {
                    errorCorrectionLevel: 'H',
                    type: 'image/png',
                    quality: 0.92,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                };

                const qrDataUrl = await QRCode.toDataURL(verifyUrl, qrOptions);
                doc.image(qrDataUrl, qrX, qrY, { width: qrSize, height: qrSize });

                // Optional: Border around QR
                doc.rect(qrX, qrY, qrSize, qrSize).strokeColor('#000000').lineWidth(1).stroke();

            } catch (err) {
                console.error("QR Gen Error:", err);
                // Fallback box if QR fails
                doc.rect(qrX, qrY, qrSize, qrSize).stroke();
                doc.text("QR Error", qrX + 10, qrY + 40);
            }

            doc.end();
            writeStream.on('finish', () => resolve(`/certificates/${fileName}`));
            writeStream.on('error', (err) => reject(err));

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateCertificate };