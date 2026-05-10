// lib/email.ts

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL!
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME!

// ─── OTP Email ───────────────────────────────────────────────
export async function sendOtpEmail({
    to,
    name,
    code,
    type,
}: {
    to: string
    name: string
    code: string
    type: "LOGIN" | "TRANSFER" | "CHANGE_PASSWORD"
}) {
    const subjects = {
        LOGIN: "Your login verification code",
        TRANSFER: "Verify your transfer",
        CHANGE_PASSWORD: "Verify password change",
    }

    const messages = {
        LOGIN: "You are attempting to log in to your account.",
        TRANSFER: "You are attempting to make a transfer.",
        CHANGE_PASSWORD: "You are attempting to change your password.",
    }

    const { error } = await resend.emails.send({
        from: `${APP_NAME} <${FROM}>`,
        to,
        subject: `${APP_NAME}: ${subjects[type]}`,
        html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          
          <div style="background: #1a3a5c; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 16px;">Hello, <strong>${name}</strong></p>
            <p style="color: #374151;">${messages[type]}</p>
            <p style="color: #374151;">Your verification code is:</p>

            <div style="background: white; border: 2px dashed #1a3a5c; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a3a5c;">
                ${code}
              </span>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              ⚠️ This code expires in <strong>5 minutes</strong>.
              Never share this code with anyone.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              If you did not request this code, please contact support immediately.
              <br />
              © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
            </p>
          </div>

        </body>
      </html>
    `,
    })

    if (error) {
        console.error("[EMAIL_ERROR]", error)
        throw new Error("Failed to send email")
    }
}