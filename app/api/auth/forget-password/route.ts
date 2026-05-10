// app/api/auth/forgot-password/route.ts

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateOtpCode, errorResponse, successResponse } from "@/lib/utils"
import { sendOtpEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email } = body

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                errorResponse("Email is required"),
                { status: 400 }
            )
        }

        // ✅ ALWAYS return success to prevent email enumeration attacks
        // Even if the email doesn't exist, we respond the same way
        const genericSuccess = successResponse(
            null,
            "If an account exists with that email, we've sent reset instructions."
        )

        // ─── Find User ───────────────────────────────────────────
        const user = await db.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: {
                id: true,
                fullName: true,
                email: true,
            },
        })

        // If user doesn't exist, return same success (no leaking)
        if (!user) {
            return NextResponse.json(genericSuccess, { status: 200 })
        }

        // ─── Rate Limit ──────────────────────────────────────────
        const recentOtp = await db.otpCode.findFirst({
            where: {
                userId: user.id,
                type: "CHANGE_PASSWORD",
                createdAt: { gt: new Date(Date.now() - 60 * 1000) },
            },
        })

        if (recentOtp) {
            return NextResponse.json(
                errorResponse("Please wait 1 minute before requesting again."),
                { status: 429 }
            )
        }

        // ─── Invalidate Old OTPs ─────────────────────────────────
        await db.otpCode.updateMany({
            where: {
                userId: user.id,
                type: "CHANGE_PASSWORD",
                usedAt: null,
            },
            data: { usedAt: new Date() },
        })

        // ─── Generate OTP ────────────────────────────────────────
        const code = generateOtpCode()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 mins

        await db.otpCode.create({
            data: {
                userId: user.id,
                code,
                type: "CHANGE_PASSWORD",
                expiresAt,
            },
        })

        // ─── Send Email ──────────────────────────────────────────
        await sendOtpEmail({
            to: user.email,
            name: user.fullName,
            code,
            type: "CHANGE_PASSWORD",
        })

        // ─── Audit Log ───────────────────────────────────────────
        await db.auditLog.create({
            data: {
                userId: user.id,
                action: "PASSWORD_RESET_REQUESTED",
                ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
                metadata: { email: user.email },
            },
        })

        return NextResponse.json(genericSuccess, { status: 200 })
    } catch (error) {
        console.error("[FORGOT_PASSWORD_ERROR]", error)
        return NextResponse.json(
            errorResponse("Something went wrong. Please try again."),
            { status: 500 }
        )
    }
}