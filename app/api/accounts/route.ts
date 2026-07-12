// app/api/accounts/route.ts

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
            select: {
                id: true,
                accountNumber: true,
                accountType: true,
                currency: true,
                balance: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: "asc" },
        })

        return NextResponse.json(
            successResponse(
                accounts.map((a: { id: string; accountNumber: string; accountType: string; currency: string; balance: { toString: () => string }; isActive: boolean; createdAt: Date }) => ({
                    ...a,
                    balance: a.balance.toString(),
                }))
            )
        )
    } catch (error) {
        console.error("[GET_ACCOUNTS_ERROR]", error)
        return NextResponse.json(
            errorResponse("Failed to fetch accounts"),
            { status: 500 }
        )
    }
}