// app/api/transactions/request-otp/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { errorResponse, successResponse, generateOtpCode } from "@/lib/utils"
import { sendOtpEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
    try {
        // ─── Auth Guard ─────────────────────────────────────────
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                errorResponse("Unauthorized"),
                { status: 401 }
            )
        }

        // ─── Rate Limiting (Simple) ──────────────────────────────
        // Check if user already requested an OTP in the last minute
        const recentOtp = await db.otpCode.findFirst({
            where: {
                userId: session.user.id,
                type: "TRANSFER",
                createdAt: { gt: new Date(Date.now() - 60 * 1000) },
            },
        })

        if (recentOtp) {
            return NextResponse.json(
                errorResponse("Please wait 1 minute before requesting a new code."),
                { status: 429 }
            )
        }

        // ─── Invalidate Old OTPs ─────────────────────────────────
        await db.otpCode.updateMany({
            where: {
                userId: session.user.id,
                type: "TRANSFER",
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
                userId: session.user.id,
                code,
                type: "TRANSFER",
                expiresAt,
            },
        })

        // ─── Get User Details ────────────────────────────────────
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { fullName: true, email: true },
        })

        // ─── Send Email ──────────────────────────────────────────
        await sendOtpEmail({
            to: user!.email,
            name: user!.fullName,
            code,
            type: "TRANSFER",
        })

        // ─── Audit Log ───────────────────────────────────────────
        await db.auditLog.create({
            data: {
                userId: session.user.id,
                action: "TRANSFER_OTP_REQUESTED",
                ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
            },
        })

        return NextResponse.json(
            successResponse(null, "Verification code sent to your email."),
            { status: 200 }
        )
    } catch (error) {
        console.error("[REQUEST_OTP_ERROR]", error)
        return NextResponse.json(
            errorResponse("Failed to send verification code."),
            { status: 500 }
        )
    }
}