// app/api/auth/reset-password/verify-otp/route.ts

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { errorResponse, successResponse } from "@/lib/utils"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, code } = body

        if (!email || !code) {
            return NextResponse.json(
                errorResponse("Email and code are required"),
                { status: 400 }
            )
        }

        // ─── Find user ───────────────────────────────────────────
        const user = await db.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: { id: true },
        })

        if (!user) {
            return NextResponse.json(
                errorResponse("Invalid or expired code"),
                { status: 400 }
            )
        }

        // ─── Validate OTP ────────────────────────────────────────
        const otpRecord = await db.otpCode.findFirst({
            where: {
                userId: user.id,
                code,
                type: "CHANGE_PASSWORD",
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
        })

        if (!otpRecord) {
            return NextResponse.json(
                errorResponse("Invalid or expired code. Please request a new one."),
                { status: 400 }
            )
        }

        // ✅ Don't mark as used yet — only mark used after password is changed
        return NextResponse.json(
            successResponse(
                { userId: user.id },
                "Code verified successfully"
            ),
            { status: 200 }
        )
    } catch (error) {
        console.error("[RESET_VERIFY_OTP_ERROR]", error)
        return NextResponse.json(
            errorResponse("Something went wrong"),
            { status: 500 }
        )
    }
}