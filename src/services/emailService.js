import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create reusable Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


export async function sendPasswordResetEmail(toEmail, resetUrl) {
    const mailOptions = {
        from: `"Babtech Computers" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Password Reset Request - Babtech Inventory",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f172a; text-align: center;">Babtech Inventory System</h2>
                <p style="font-size: 15px; color: #334155;">Hello,</p>
                <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                    You recently requested to reset your password for your Babtech Inventory account. Click the button below to proceed. This link will expire in 15 minutes.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">
                    If the button above does not work, copy and paste this URL into your browser:<br/>
                    <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                    If you did not request a password reset, please ignore this email.
                </p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
}