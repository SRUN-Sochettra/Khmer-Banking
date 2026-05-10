// app/api/auth/resend-otp/route.ts

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateOtpCode, errorResponse, successResponse } from "@/lib/utils"
import { sendOtpEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId } = body

        // ─── Validate ────────────────────────────────────────────
        if (!userId || typeof userId !== "string") {
            return NextResponse.json(
                errorResponse("User ID is required"),
                { status: 400 }
            )
        }

        // ─── Find User ───────────────────────────────────────────
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                isVerified: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                errorResponse("User not found"),
                { status: 404 }
            )
        }

        // ─── Already Verified? ───────────────────────────────────
        if (user.isVerified) {
            return NextResponse.json(
                errorResponse("This account is already verified"),
                { status: 400 }
            )
        }

        // ─── Rate Limit: 1 resend per 60 seconds ─────────────────
        const recentOtp = await db.otpCode.findFirst({
            where: {
                userId,
                type: "LOGIN",
                createdAt: { gt: new Date(Date.now() - 60 * 1000) },
            },
        })

        if (recentOtp) {
            return NextResponse.json(
                errorResponse("Please wait 1 minute before requesting a new code."),
                { status: 429 }
            )
        }

        // ─── Invalidate All Previous Unused OTPs ─────────────────
        await db.otpCode.updateMany({
            where: {
                userId,
                type: "LOGIN",
                usedAt: null,
            },
            data: {
                usedAt: new Date(),
            },
        })

        // ─── Generate New OTP ────────────────────────────────────
        const code = generateOtpCode()
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 mins

        await db.otpCode.create({
            data: {
                userId,
                code,
                type: "LOGIN",
                expiresAt,
            },
        })

        // ─── Send Email ──────────────────────────────────────────
        await sendOtpEmail({
            to: user.email,
            name: user.fullName,
            code,
            type: "LOGIN",
        })

        // ─── Audit Log ───────────────────────────────────────────
        await db.auditLog.create({
            data: {
                userId,
                action: "OTP_RESENT",
                ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
                metadata: { email: user.email },
            },
        })

        return NextResponse.json(
            successResponse(null, "A new verification code has been sent to your email."),
            { status: 200 }
        )
    } catch (error) {
        console.error("[RESEND_OTP_ERROR]", error)
        return NextResponse.json(
            errorResponse("Failed to resend code. Please try again."),
            { status: 500 }
        )
    }
}