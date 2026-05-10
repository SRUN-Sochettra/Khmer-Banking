// app/api/auth/verify-otp/route.ts

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { OtpSchema } from "@/lib/validations"
import { errorResponse, successResponse } from "@/lib/utils"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId, code } = body

        // 1. Validate OTP format
        const parsed = OtpSchema.safeParse({ code })
        if (!parsed.success) {
            return NextResponse.json(
                errorResponse("Invalid OTP format"),
                { status: 400 }
            )
        }

        if (!userId) {
            return NextResponse.json(
                errorResponse("User ID is required"),
                { status: 400 }
            )
        }

        // 2. Find the OTP
        const otpRecord = await db.otpCode.findFirst({
            where: {
                userId,
                code,
                type: "LOGIN",
                usedAt: null, // Not used yet
                expiresAt: { gt: new Date() }, // Not expired
            },
        })

        if (!otpRecord) {
            return NextResponse.json(
                errorResponse("Invalid or expired OTP code. Please try again."),
                { status: 400 }
            )
        }

        // 3. Mark OTP as used + verify user
        await db.$transaction([
            db.otpCode.update({
                where: { id: otpRecord.id },
                data: { usedAt: new Date() },
            }),
            db.user.update({
                where: { id: userId },
                data: { isVerified: true },
            }),
        ])

        return NextResponse.json(
            successResponse(null, "Email verified successfully. You can now log in."),
            { status: 200 }
        )
    } catch (error) {
        console.error("[VERIFY_OTP_ERROR]", error)
        return NextResponse.json(
            errorResponse("Something went wrong. Please try again."),
            { status: 500 }
        )
    }
}