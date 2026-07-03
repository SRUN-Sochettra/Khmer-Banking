import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { errorResponse, successResponse } from "@/lib/utils"
import { TransactionType, TransactionStatus } from "@prisma/client"
import { Prisma } from "@prisma/client"

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
        const status = searchParams.get("status")
        const query = searchParams.get("query")
        const skip = (page - 1) * limit

        // ✅ Validate transaction type against the actual enum
        const validTypes = Object.values(TransactionType)
        const filterType = type && validTypes.includes(type as TransactionType)
            ? (type as TransactionType)
            : undefined

        // ✅ If type was provided but invalid, reject it
        if (type && type !== "ALL" && !filterType) {
            return NextResponse.json(
                errorResponse(
                    `Invalid transaction type. Must be one of: ${validTypes.join(", ")}`
                ),
                { status: 400 }
            )
        }

        const validStatuses = Object.values(TransactionStatus)
        const filterStatus = status && validStatuses.includes(status as TransactionStatus)
            ? (status as TransactionStatus)
            : undefined

        if (status && status !== "ALL" && !filterStatus) {
            return NextResponse.json(
                errorResponse(
                    `Invalid transaction status. Must be one of: ${validStatuses.join(", ")}`
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
        const where: Prisma.TransactionWhereInput = {
            AND: [
                {
                    OR: [
                        { senderAccountId: { in: accountIds } },
                        { receiverAccountId: { in: accountIds } },
                    ],
                }
            ],
        }

        if (filterType) {
            (where.AND as Prisma.TransactionWhereInput[]).push({ type: filterType })
        }

        if (filterStatus) {
            (where.AND as Prisma.TransactionWhereInput[]).push({ status: filterStatus })
        }

        if (query) {
            (where.AND as Prisma.TransactionWhereInput[]).push({
                OR: [
                    { reference: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                    {
                        senderAccount: {
                            user: { fullName: { contains: query, mode: "insensitive" } }
                        }
                    },
                    {
                        receiverAccount: {
                            user: { fullName: { contains: query, mode: "insensitive" } }
                        }
                    }
                ]
            })
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
