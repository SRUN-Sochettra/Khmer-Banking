// app/api/statements/generate/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { renderToBuffer } from "@react-pdf/renderer"
import { StatementDocument } from "@/components/statements/statement-document"
import { startOfMonth, endOfMonth } from "date-fns"
import { createElement } from "react"

export async function GET(req: NextRequest) {
    try {
        // ─── Auth Guard ─────────────────────────────────────────
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // ─── Query Params ────────────────────────────────────────
        const { searchParams } = new URL(req.url)
        const month = parseInt(searchParams.get("month") ?? `${new Date().getMonth() + 1}`)
        const year = parseInt(searchParams.get("year") ?? `${new Date().getFullYear()}`)
        const currency = (searchParams.get("currency") ?? "USD") as "USD" | "KHR"
        const accountId = searchParams.get("accountId")

        // Validate
        if (month < 1 || month > 12) {
            return NextResponse.json({ error: "Invalid month" }, { status: 400 })
        }

        // ─── Date Range ───────────────────────────────────────────
        const periodDate = new Date(year, month - 1, 1)
        const startDate = startOfMonth(periodDate)
        const endDate = endOfMonth(periodDate)

        // ─── Fetch User ───────────────────────────────────────────
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: {
                fullName: true,
                email: true,
                phone: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // ─── Fetch Account ────────────────────────────────────────
        const account = await db.account.findFirst({
            where: {
                userId: session.user.id,
                currency,
                ...(accountId ? { id: accountId } : {}),
            },
        })

        if (!account) {
            return NextResponse.json(
                { error: `No ${currency} account found` },
                { status: 404 }
            )
        }

        // ─── Fetch Transactions ───────────────────────────────────
        const transactions = await db.transaction.findMany({
            where: {
                OR: [
                    { senderAccountId: account.id },
                    { receiverAccountId: account.id },
                ],
                status: "COMPLETED",
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                senderAccount: {
                    include: { user: { select: { fullName: true } } },
                },
                receiverAccount: {
                    include: { user: { select: { fullName: true } } },
                },
            },
            orderBy: { createdAt: "asc" },
        })

        // ─── Calculate Summary ────────────────────────────────────
        let totalCredits = 0
        let totalDebits = 0

        const mappedTransactions = transactions.map((txn) => {
            const isSender = txn.senderAccountId === account.id
            const amount = txn.amount.toNumber()

            if (isSender) {
                totalDebits += amount
            } else {
                totalCredits += amount
            }

            return {
                id: txn.id,
                reference: txn.reference,
                type: txn.type,
                status: txn.status,
                amount: txn.amount.toString(),
                currency: txn.currency,
                description: txn.description,
                createdAt: txn.createdAt,
                isSender,
                counterpartName: isSender
                    ? txn.receiverAccount.user.fullName
                    : txn.senderAccount.user.fullName,
                counterpartAccount: isSender
                    ? txn.receiverAccount.accountNumber
                    : txn.senderAccount.accountNumber,
            }
        })

        // Opening balance = closing - credits + debits
        const closingBalance = account.balance.toNumber()
        const openingBalance = closingBalance - totalCredits + totalDebits

        const monthNames = [
            "January", "February", "March", "April",
            "May", "June", "July", "August",
            "September", "October", "November", "December",
        ]

        const statementData = {
            user,
            account: {
                accountNumber: account.accountNumber,
                accountType: account.accountType,
                currency: account.currency,
            },
            period: {
                month: monthNames[month - 1],
                year: year.toString(),
                startDate,
                endDate,
            },
            summary: {
                openingBalance,
                closingBalance,
                totalCredits,
                totalDebits,
                totalTransactions: transactions.length,
            },
            transactions: mappedTransactions,
        }

        // ─── Generate PDF ─────────────────────────────────────────
        const pdfBuffer = await renderToBuffer(
            createElement(StatementDocument, { data: statementData })
        )

        // ─── Audit Log ────────────────────────────────────────────
        await db.auditLog.create({
            data: {
                userId: session.user.id,
                action: "STATEMENT_DOWNLOADED",
                ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
                metadata: {
                    month,
                    year,
                    currency,
                    accountId: account.id,
                    transactionCount: transactions.length,
                },
            },
        })

        // ─── Stream PDF to Browser ────────────────────────────────
        const fileName = `KhmerBank_Statement_${monthNames[month - 1]}_${year}.pdf`

        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "Content-Length": pdfBuffer.length.toString(),
                "Cache-Control": "no-store",
            },
        })
    } catch (error) {
        console.error("[STATEMENT_GENERATE_ERROR]", error)
        return NextResponse.json(
            { error: "Failed to generate statement" },
            { status: 500 }
        )
    }
}