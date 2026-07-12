// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { RegisterSchema } from "@/lib/validations"
import { generateAccountNumber, generateOtpCode, errorResponse, successResponse } from "@/lib/utils"
import { sendOtpEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate body
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("Validation failed", parsed.error.flatten().fieldErrors),
        { status: 400 }
      )
    }

    const { fullName, email, phone, password } = parsed.data

    console.log("[PRISMA_RUNTIME_INFO]", {
      hasAdapter: !!(db as unknown as { _engineConfig?: { adapter?: unknown } })._engineConfig?.adapter,
      engineConfigKeys: Object.keys(
        ((db as unknown as { _engineConfig?: Record<string, unknown> })._engineConfig ?? {})
      ),
    })

    // 2. Check if email already exists
    const existingUser = await db.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    })

    if (existingUser) {
      return NextResponse.json(
        errorResponse(
          existingUser.email === email
            ? "An account with this email already exists"
            : "An account with this phone number already exists"
        ),
        { status: 409 }
      )
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // 4. Create user + account in a transaction
    const user = await db.$transaction(async (tx: Parameters<Parameters<typeof db.$transaction>[0]>[0]) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          fullName,
          email,
          phone,
          passwordHash,
          isVerified: false,
        },
      })

      // Create default savings account (USD)
      await tx.account.create({
        data: {
          userId: newUser.id,
          accountNumber: generateAccountNumber(),
          accountType: "SAVINGS",
          currency: "USD",
          balance: 0,
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: "REGISTER",
          ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
          metadata: { email, phone },
        },
      })

      return newUser
    })

    // 5. Generate and save OTP
    const otpCode = generateOtpCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    await db.otpCode.create({
      data: {
        userId: user.id,
        code: otpCode,
        type: "LOGIN",
        expiresAt,
      },
    })

    // 6. Send OTP email
    await sendOtpEmail({
      to: email,
      name: fullName,
      code: otpCode,
      type: "LOGIN",
    })

    return NextResponse.json(
      successResponse(
        { userId: user.id, email: user.email },
        "Account created! Please check your email for the verification code."
      ),
      { status: 201 }
    )
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json(
      errorResponse("Something went wrong. Please try again."),
      { status: 500 }
    )
  }
}