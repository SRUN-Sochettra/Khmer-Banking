// app/api/dashboard/insights/route.ts

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { errorResponse, successResponse } from "@/lib/utils"

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json(errorResponse("Unauthorized"), { status: 401 })
        }

        const accounts = await db.account.findMany({
            where: { userId: session.user.id },
            select: { id: true },
        })

        const accountIds = accounts.map((a) => a.id)

        // ─── Last 6 months of completed transactions ─────────────
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const transactions = await db.transaction.findMany({
            where: {
                OR: [
                    { senderAccountId: { in: accountIds } },
                    { receiverAccountId: { in: accountIds } },
                ],
                status: "COMPLETED",
                createdAt: { gte: sixMonthsAgo },
            },
            select: {
                id: true,
                amount: true,
                currency: true,
                createdAt: true,
                senderAccountId: true,
                receiverAccountId: true,
            },
            orderBy: { createdAt: "asc" },
        })

        // ─── Map with isSender ───────────────────────────────────
        const mapped = transactions.map((txn) => ({
            id: txn.id,
            amount: txn.amount.toString(),
            currency: txn.currency,
            createdAt: txn.createdAt,
            isSender: accountIds.includes(txn.senderAccountId),
        }))

        // ─── Quick stats ─────────────────────────────────────────
        const totalSentUSD = mapped
            .filter((t) => t.isSender && t.currency === "USD")
            .reduce((s, t) => s + parseFloat(t.amount), 0)

        const totalReceivedUSD = mapped
            .filter((t) => !t.isSender && t.currency === "USD")
            .reduce((s, t) => s + parseFloat(t.amount), 0)

        const totalTransactions = mapped.length

        // ─── This month vs last month ────────────────────────────
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

        const thisMonthSpend = mapped
            .filter(
                (t) =>
                    t.isSender &&
                    t.currency === "USD" &&
                    new Date(t.createdAt) >= thisMonthStart
            )
            .reduce((s, t) => s + parseFloat(t.amount), 0)

        const lastMonthSpend = mapped
            .filter(
                (t) =>
                    t.isSender &&
                    t.currency === "USD" &&
                    new Date(t.createdAt) >= lastMonthStart &&
                    new Date(t.createdAt) < thisMonthStart
            )
            .reduce((s, t) => s + parseFloat(t.amount), 0)

        const spendingChange =
            lastMonthSpend === 0
                ? null
                : ((thisMonthSpend - lastMonthSpend) / lastMonthSpend) * 100

        return NextResponse.json(
            successResponse({
                transactions: mapped,
                stats: {
                    totalSentUSD,
                    totalReceivedUSD,
                    totalTransactions,
                    thisMonthSpend,
                    lastMonthSpend,
                    spendingChange,
                },
            })
        )
    } catch (error) {
        console.error("[INSIGHTS_ERROR]", error)
        return NextResponse.json(
            errorResponse("Failed to load insights"),
            { status: 500 }
        )
    }
}