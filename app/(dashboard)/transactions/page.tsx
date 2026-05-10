"use client"

import { useEffect, useState, useTransition } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    X,
    Filter,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Transaction = {
    id: string
    reference: string
    amount: string
    currency: string
    type: string
    status: string
    description: string | null
    createdAt: string
    senderAccountId: string
    receiverAccountId: string
    senderAccount: { user: { fullName: string } }
    receiverAccount: { user: { fullName: string } }
}

type Pagination = {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

const statusColors: Record<string, string> = {
    COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
    PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
    REVERSED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [accountIds, setAccountIds] = useState<string[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [type, setType] = useState("ALL")
    const [status, setStatus] = useState("ALL")
    const [page, setPage] = useState(1)

    // ✅ useTransition — the React Compiler-safe way to 
    // trigger async state updates
    const [, startTransition] = useTransition()

    // ✅ Load accounts + transactions together in one effect
    // State updates happen inside startTransition callback
    useEffect(() => {
        setIsLoading(true)

        const params = new URLSearchParams({
            page: page.toString(),
            limit: "10",
            ...(type !== "ALL" && { type }),
        })

        Promise.all([
            fetch("/api/accounts").then((r) => r.json()),
            fetch(`/api/transactions?${params}`).then((r) => r.json()),
        ]).then(([accountResult, txnResult]) => {
            startTransition(() => {
                if (accountResult.success) {
                    setAccountIds(
                        accountResult.data.map((a: { id: string }) => a.id)
                    )
                }
                if (txnResult.success) {
                    setTransactions(txnResult.data.transactions)
                    setPagination(txnResult.data.pagination)
                }
                setIsLoading(false)
            })
        }).catch((err) => {
            console.error("[FETCH_ERROR]", err)
            startTransition(() => setIsLoading(false))
        })
    }, [page, type]) // ✅ Direct deps — no useCallback needed

    // ─── Client-side search + status filter ──────────────────
    const filtered = transactions.filter((txn) => {
        const isSender = accountIds.includes(txn.senderAccountId)
        const counterpart = isSender
            ? txn.receiverAccount?.user?.fullName
            : txn.senderAccount?.user?.fullName

        const matchesSearch =
            search === "" ||
            txn.reference.toLowerCase().includes(search.toLowerCase()) ||
            (counterpart ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (txn.description ?? "").toLowerCase().includes(search.toLowerCase())

        const matchesStatus = status === "ALL" || txn.status === status

        return matchesSearch && matchesStatus
    })

    const handleClearFilters = () => {
        setSearch("")
        setType("ALL")
        setStatus("ALL")
        setPage(1)
    }

    const hasActiveFilters = search !== "" || type !== "ALL" || status !== "ALL"

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Transactions</h1>
                <p className="text-slate-400">Your complete transaction history</p>
            </div>

            {/* ── Filters ──────────────────────────────────────── */}
            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search by reference, name, description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-9"
                            />
                        </div>

                        <div className="w-full sm:w-40">
                            <Select
                                value={type}
                                onValueChange={(v) => {
                                    setType(v)
                                    setPage(1)
                                }}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                    <Filter className="w-4 h-4 mr-2 text-slate-400" />
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="ALL" className="text-white">
                                        All Types
                                    </SelectItem>
                                    <SelectItem value="TRANSFER" className="text-white">
                                        Transfer
                                    </SelectItem>
                                    <SelectItem value="DEPOSIT" className="text-white">
                                        Deposit
                                    </SelectItem>
                                    <SelectItem value="WITHDRAWAL" className="text-white">
                                        Withdrawal
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full sm:w-40">
                            <Select
                                value={status}
                                onValueChange={(v) => {
                                    setStatus(v)
                                    setPage(1)
                                }}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="ALL" className="text-white">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="COMPLETED" className="text-white">
                                        Completed
                                    </SelectItem>
                                    <SelectItem value="PENDING" className="text-white">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="FAILED" className="text-white">
                                        Failed
                                    </SelectItem>
                                    <SelectItem value="REVERSED" className="text-white">
                                        Reversed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ── Transaction List ──────────────────────────────── */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">All Transactions</CardTitle>
                    <span className="text-slate-500 text-sm">
                        {isLoading
                            ? "Loading..."
                            : `${pagination?.total ?? 0} records`}
                    </span>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-16 w-full bg-slate-800"
                                />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <ArrowUpRight className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No transactions found</p>
                            <p className="text-sm mt-1">
                                {hasActiveFilters
                                    ? "Try adjusting your filters"
                                    : "Your transfers will appear here"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filtered.map((txn) => (
                                <TransactionRow
                                    key={txn.id}
                                    txn={txn}
                                    accountIds={accountIds}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── Pagination ─────────────────────────────── */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
                            <p className="text-slate-500 text-sm">
                                Page {pagination.page} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.hasPreviousPage || isLoading}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.hasNextPage || isLoading}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// ─── Transaction Row ──────────────────────────────────────────
function TransactionRow({
    txn,
    accountIds,
}: {
    txn: Transaction
    accountIds: string[]
}) {
    const isSender = accountIds.includes(txn.senderAccountId)

    return (
        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-full ${
                    isSender
                        ? "bg-red-500/10 text-red-400"
                        : "bg-green-500/10 text-green-400"
                }`}>
                    {isSender
                        ? <ArrowUpRight className="w-5 h-5" />
                        : <ArrowDownLeft className="w-5 h-5" />
                    }
                </div>
                <div>
                    <p className="text-white font-medium">
                        {isSender
                            ? `To: ${txn.receiverAccount?.user?.fullName}`
                            : `From: ${txn.senderAccount?.user?.fullName}`}
                    </p>
                    {txn.description && (
                        <p className="text-slate-400 text-xs mt-0.5">
                            {txn.description}
                        </p>
                    )}
                    <p className="text-slate-500 text-xs mt-0.5 font-mono">
                        {txn.reference}
                    </p>
                    <p className="text-slate-600 text-xs">
                        {formatDate(txn.createdAt)}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold text-lg ${
                    isSender ? "text-red-400" : "text-green-400"
                }`}>
                    {isSender ? "-" : "+"}
                    {formatCurrency(
                        txn.amount,
                        txn.currency as "USD" | "KHR"
                    )}
                </p>
                <Badge
                    className={`text-xs border mt-1 ${statusColors[txn.status]}`}
                >
                    {txn.status}
                </Badge>
            </div>
        </div>
    )
}