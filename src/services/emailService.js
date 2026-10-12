import { Resend } from "resend";
import dotenv from "dotenv"

dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail(toEmail, resetUrl) {

    const { data, error } = await resend.emails.send({
        from: "Babtech Inventory <onboarding@resend.dev>",
        to: [toEmail],
        subject: "Reset Your Password - Babtech Inventory",
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Password Reset Request</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                You requested a password reset for your account on the <strong>Babtech Hardware Inventory System</strong>.
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                Click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.
            </p>
            <div style="margin: 28px 0;">
                <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p style="font-size: 13px; line-height: 1.5; color: #64748b;">
                If you did not request a password reset, you can safely disregard this email. Your current password remains unchanged.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                Babtech School of Technology &bull; Hardware Inventory Management System
            </p>
        </div>`
    })

    if (error) {
        throw new Error(error.message)
    }

    return data
}