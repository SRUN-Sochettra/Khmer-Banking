// app/api/transactions/transfer/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { TransferSchema } from "@/lib/validations"
import {
    errorResponse,
    successResponse,
    generateTransactionReference,
} from "@/lib/utils"


export async function POST(req: NextRequest) {
    try {
        // ─── Step 1: Auth Guard ─────────────────────────────────
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(
                errorResponse("Unauthorized. Please log in again."),
                { status: 401 }
            )
        }

        // ─── Step 2: Validate Input ─────────────────────────────
        const body = await req.json()
        const parsed = TransferSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                errorResponse("Validation failed", parsed.error.flatten().fieldErrors),
                { status: 400 }
            )
        }

        const {
            receiverAccountNumber,
            amount,
            currency,
            description,
            otpCode
        } = parsed.data

        // ─── Step 3: Verify OTP ─────────────────────────────────
        const otpRecord = await db.otpCode.findFirst({
            where: {
                userId: session.user.id,
                code: otpCode,
                type: "TRANSFER",
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
        })

        if (!otpRecord) {
            // Log failed OTP attempt
            await db.auditLog.create({
                data: {
                    userId: session.user.id,
                    action: "TRANSFER_OTP_FAILED",
                    ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
                    metadata: { receiverAccountNumber, amount, currency },
                },
            })

            return NextResponse.json(
                errorResponse("Invalid or expired OTP. Transfer cancelled."),
                { status: 400 }
            )
        }

        // ─── Step 4: Find Sender's Account ──────────────────────
        const senderAccount = await db.account.findFirst({
            where: {
                userId: session.user.id,
                currency,
                isActive: true,
            },
        })

        if (!senderAccount) {
            return NextResponse.json(
                errorResponse(`You don't have an active ${currency} account.`),
                { status: 404 }
            )
        }

        // ─── Step 5: Self-Transfer Check ────────────────────────
        if (senderAccount.accountNumber === receiverAccountNumber) {
            return NextResponse.json(
                errorResponse("You cannot transfer money to your own account."),
                { status: 400 }
            )
        }

        // ─── Step 6: Find Receiver's Account ────────────────────
        const receiverAccount = await db.account.findFirst({
            where: {
                accountNumber: receiverAccountNumber,
                currency,
                isActive: true,
            },
        })

        if (!receiverAccount) {
            return NextResponse.json(
                errorResponse("Receiver account not found or currency mismatch."),
                { status: 404 }
            )
        }

        // ─── Step 7: Balance Check ───────────────────────────────
        const transferAmount = Number(amount)
        const minimumBalance = 0

        if (Number(senderAccount.balance) < transferAmount) {
            return NextResponse.json(
                errorResponse("Insufficient balance to complete this transfer."),
                { status: 400 }
            )
        }

        const balanceAfterTransfer = Number(senderAccount.balance) - transferAmount
        if (balanceAfterTransfer < minimumBalance) {
            return NextResponse.json(
                errorResponse("Transfer would bring your balance below minimum."),
                { status: 400 }
            )
        }

        // ─── Step 8: THE ATOMIC TRANSACTION ─────────────────────
        // This is the most critical part.
        // Everything inside $transaction either ALL succeeds 
        // or ALL fails. No partial updates.
        const result = await db.$transaction(async (tx: Parameters<Parameters<typeof db.$transaction>[0]>[0]) => {

            // LOCK: Read sender with a lock to prevent race conditions
            // If two transfers happen simultaneously, only one proceeds
            const lockedSender = await tx.$queryRaw<Array<{ balance: string }>>`
        SELECT balance FROM accounts 
        WHERE id = ${senderAccount.id}
        FOR UPDATE
      `

            // Re-validate balance after acquiring lock
            const currentBalance = Number(lockedSender[0].balance)
            if (currentBalance < transferAmount) {
                throw new Error("INSUFFICIENT_BALANCE")
            }

            // DEDUCT from sender
            const updatedSender = await tx.account.update({
                where: { id: senderAccount.id },
                data: {
                    balance: {
                        decrement: transferAmount,
                    },
                },
            })

            // ADD to receiver
            const updatedReceiver = await tx.account.update({
                where: { id: receiverAccount.id },
                data: {
                    balance: {
                        increment: transferAmount,
                    },
                },
            })

            // RECORD the transaction
            const transaction = await tx.transaction.create({
                data: {
                    senderAccountId: senderAccount.id,
                    receiverAccountId: receiverAccount.id,
                    amount: transferAmount,
                    currency,
                    type: "TRANSFER",
                    status: "COMPLETED",
                    description: description ?? null,
                    reference: generateTransactionReference(),
                    completedAt: new Date(),
                },
            })

            // MARK OTP as used (prevent replay attacks)
            await tx.otpCode.update({
                where: { id: otpRecord.id },
                data: { usedAt: new Date() },
            })

            // AUDIT LOG
            await tx.auditLog.create({
                data: {
                    userId: session.user.id,
                    action: "TRANSFER_COMPLETED",
                    ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
                    metadata: {
                        transactionId: transaction.id,
                        reference: transaction.reference,
                        amount,
                        currency,
                        senderAccount: senderAccount.accountNumber,
                        receiverAccount: receiverAccountNumber,
                        balanceBefore: senderAccount.balance.toString(),
                        balanceAfter: updatedSender.balance.toString(),
                    },
                },
            })

            return { transaction, updatedSender, updatedReceiver }
        })

        // ─── Step 9: Return Success ──────────────────────────────
        return NextResponse.json(
            successResponse(
                {
                    reference: result.transaction.reference,
                    amount,
                    currency,
                    receiverAccount: receiverAccountNumber,
                    newBalance: result.updatedSender.balance.toString(),
                    completedAt: result.transaction.completedAt,
                },
                "Transfer completed successfully!"
            ),
            { status: 200 }
        )

    } catch (error) {
        // ─── Handle Known Errors ─────────────────────────────────
        if (error instanceof Error) {
            if (error.message === "INSUFFICIENT_BALANCE") {
                return NextResponse.json(
                    errorResponse("Insufficient balance. Transfer cancelled."),
                    { status: 400 }
                )
            }
        }

        console.error("[TRANSFER_ERROR]", error)
        return NextResponse.json(
            errorResponse("Transfer failed. Please try again."),
            { status: 500 }
        )
    }
}