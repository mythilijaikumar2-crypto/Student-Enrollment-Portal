this # NXT SYNC - Certificate Management System

NXT SYNC is a modern, automated platform designed to streamline course enrollments, track student progress, and generate professional, verifiable certificates. It provides dedicated portals for both Students and Administrators, ensuring a seamless academic management experience.

## 🚀 Features

*   **Automated Enrollment**: Students can enroll in courses and receive instant credentials via email.
*   **Dynamic Dashboard**: Real-time statistics for both students (progress, certificates) and admins (enrollments, requests).
*   **Certificate Engine**: Auto-generates high-quality PDF certificates with:
    *   Unique Verification ID.
    *   Scannable QR Code for instant verification.
    *   ISO & AICTE Certification Badges.
*   **Approval Workflow**: Admins can review, approve, or reject certificate requests with a single click.
*   **Security**: Role-based authentication (Admin/Student) and secure data handling.

## 🛠️ Technology Stack

*   **Frontend**: HTML5, CSS3 (Modern UI), Vanilla JavaScript.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose ODM).
*   **Key Libraries**:
    *   `pdfkit` & `qrcode`: For server-side certificate generation.
    *   `nodemailer`: For automated email notifications.
    *   `jsonwebtoken`: For secure authentication.

## 📦 Installation & Setup

Follow these steps to set up the project locally.

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v14+)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Running locally or Atlas URI)

### 2. Backend Setup
The backend handles the API, database connection, and certificate generation.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    Create a `.env` file in the `backend` folder with the following:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/nxtsync
    JWT_SECRET=your_jwt_secret_key_here
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    ```
    *(Note: For email features to work, use a valid Gmail App Password)*

4.  Seed the Database (Create Admin & Courses):
    ```bash
    npm run seed
    ```
    *This will create the default Admin account and populate initial courses.*

5.  Start the Server:
    ```bash
    npm run dev
    ```
    *Server will start on `http://localhost:5000`*

### 3. Frontend Setup
The frontend is built with static files and can be served easily.

1.  Navigate to the `frontend` directory.
2.  Open `index.html` in your browser.
    *   *Recommended*: Use VS Code's **Live Server** extension for the best experience.

## 🔑 Default Credentials

Use these credentials to access the Admin Dashboard after seeding the database.

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@nxtsync.com` | `password123` |

## 🛡️ Usage Workflow

1.  **Enrollment**: A new student visits `enroll.html`, fills the form, and selects a course. They receive a **Student ID** and **Password** (simulated on screen + email).
2.  **Student Login**: Student logs in, tracks progress, and requests a certificate upon completion.
3.  **Admin Verification**: Admin logs in, sees the "Pending Request", and clicks **Approve**.
4.  **Certificate Delivery**: The system generates the PDF with a QR code and emails it to the student.
5.  **Verification**: Anyone can scan the QR code to verify the certificate's authenticity.

---
*Developed by NXT SYNC Team*
