// app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { errorResponse, successResponse } from "@/lib/utils"
import { z } from "zod"

const ResetSchema = z.object({
    userId: z.string().min(1),
    code: z.string().length(6),
    newPassword: z
        .string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[0-9]/)
        .regex(/[^A-Za-z0-9]/),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const parsed = ResetSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                errorResponse("Invalid request"),
                { status: 400 }
            )
        }

        const { userId, code, newPassword } = parsed.data

        // ─── Re-validate OTP (prevent bypass) ───────────────────
        const otpRecord = await db.otpCode.findFirst({
            where: {
                userId,
                code,
                type: "CHANGE_PASSWORD",
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
        })

        if (!otpRecord) {
            return NextResponse.json(
                errorResponse("Invalid or expired code. Please start again."),
                { status: 400 }
            )
        }

        // ─── Hash new password ───────────────────────────────────
        const passwordHash = await bcrypt.hash(newPassword, 12)

        // ─── Atomic: update password + mark OTP used ─────────────
        await db.$transaction([
            db.user.update({
                where: { id: userId },
                data: { passwordHash },
            }),
            db.otpCode.update({
                where: { id: otpRecord.id },
                data: { usedAt: new Date() },
            }),
            db.auditLog.create({
                data: {
                    userId,
                    action: "PASSWORD_RESET_COMPLETED",
                    ipAddress:
                        req.headers.get("x-forwarded-for") ?? "unknown",
                    metadata: { timestamp: new Date().toISOString() },
                },
            }),
        ])

        return NextResponse.json(
            successResponse(null, "Password reset successfully."),
            { status: 200 }
        )
    } catch (error) {
        console.error("[RESET_PASSWORD_ERROR]", error)
        return NextResponse.json(
            errorResponse("Something went wrong. Please try again."),
            { status: 500 }
        )
    }
}