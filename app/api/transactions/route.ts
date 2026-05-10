// app/api/transactions/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { errorResponse, successResponse } from "@/lib/utils"
import { TransactionType } from "@prisma/client"

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(errorResponse("Unauthorized"), { status: 401 })
        }

        // ─── Query Params ────────────────────────────────────────
        const { searchParams } = new URL(req.url)
        const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
        const type = searchParams.get("type")
        const skip = (page - 1) * limit

        // ✅ Validate transaction type against the actual enum
        const validTypes = Object.values(TransactionType)
        const filterType = type && validTypes.includes(type as TransactionType)
            ? (type as TransactionType)
            : undefined

        // ✅ If type was provided but invalid, reject it
        if (type && !filterType) {
            return NextResponse.json(
                errorResponse(
                    `Invalid transaction type. Must be one of: ${validTypes.join(", ")}`
                ),
                { status: 400 }
            )
        }

        // ─── Get User's Account IDs ──────────────────────────────
        const userAccounts = await db.account.findMany({
            where: { userId: session.user.id },
            select: { id: true },
        })

        const accountIds = userAccounts.map((a) => a.id)

        // ─── Build Filter ────────────────────────────────────────
        const where = {
            OR: [
                { senderAccountId: { in: accountIds } },
                { receiverAccountId: { in: accountIds } },
            ],
            ...(filterType && { type: filterType }),
        }

        // ─── Fetch Transactions + Count ──────────────────────────
        const [transactions, total] = await Promise.all([
            db.transaction.findMany({
                where,
                include: {
                    senderAccount: {
                        include: { user: { select: { fullName: true } } },
                    },
                    receiverAccount: {
                        include: { user: { select: { fullName: true } } },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            db.transaction.count({ where }),
        ])

        return NextResponse.json(
            successResponse({
                transactions,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPreviousPage: page > 1,
                },
            }),
            { status: 200 }
        )
    } catch (error) {
        console.error("[GET_TRANSACTIONS_ERROR]", error)
        return NextResponse.json(
            errorResponse("Failed to fetch transactions."),
            { status: 500 }
        )
    }
}