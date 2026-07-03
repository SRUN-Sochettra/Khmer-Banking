// types/index.ts

import { User, Account, Transaction } from "@prisma/client"

// ─── Extended Types ──────────────────────────────────────────
export type UserWithAccounts = User & {
    accounts: Account[]
}

export type TransactionWithAccounts = Transaction & {
    senderAccount: Account & { user: User }
    receiverAccount: Account & { user: User }
}

// ─── API Response Types ──────────────────────────────────────
export type ApiResponse<T = null> = {
    success: boolean
    message: string
    data?: T
    errors?: unknown
}

// ─── Dashboard Types ─────────────────────────────────────────
export type DashboardData = {
    totalBalanceUSD: number
    totalBalanceKHR: number
    accounts: Account[]
    recentTransactions: TransactionWithAccounts[]
}

// ─── NextAuth Type Extension ─────────────────────────────────
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name: string
            email: string
            image?: string
        }
    }
}