import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { formatCurrency, maskAccountNumber } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react"
import Link from "next/link"
import { KHQRCard } from "@/components/dashboard/khqr-card"
import { InsightsSection } from "@/components/dashboard/insights-section"

export default async function DashboardPage() {
    const session = await auth()
    // ✅ Guard added
    if (!session?.user?.id) redirect("/login")

    const accounts = await db.account.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
    })

    const usdAccount = accounts.find((a) => a.currency === "USD")

    // ✅ Fetch real recent transactions
    const userAccountIds = accounts.map((a) => a.id)

    const recentTransactions = await db.transaction.findMany({
        where: {
            OR: [
                { senderAccountId: { in: userAccountIds } },
                { receiverAccountId: { in: userAccountIds } },
            ],
        },
        include: {
            senderAccount: {
                include: { user: { select: { fullName: true } } },
            },
            receiverAccount: {
                include: { user: { select: { fullName: true } } },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
    })

    const usdBalance = accounts.find((a) => a.currency === "USD")?.balance.toNumber() ?? 0
    const khrBalance = accounts.find((a) => a.currency === "KHR")?.balance.toNumber() ?? 0

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Overview</h1>
                <p className="text-slate-400">Monitor your assets and recent activity</p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                    <Card
                        key={account.id}
                        className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-colors"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                {account.accountType} — {account.currency}
                            </CardTitle>
                            <Wallet className="w-4 h-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {formatCurrency(
                                    account.balance.toString(),
                                    account.currency as "USD" | "KHR"
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-mono">
                                {maskAccountNumber(account.accountNumber)}
                            </p>
                        </CardContent>
                    </Card>
                ))}

                {/* Total Assets */}
                <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">
                            Total Assets (USD)
                        </CardTitle>
                        <CreditCard className="w-4 h-4 text-blue-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {formatCurrency(usdBalance + khrBalance / 4100)}
                        </div>
                        <p className="text-xs text-blue-200 mt-1">
                            Approx. based on 1 USD = 4,100 KHR
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ✅ Real Recent Transactions */}
                <div className="lg:col-span-2">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white">Recent Transactions</CardTitle>
                            <Link
                                href="/transactions"
                                className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                                View all →
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentTransactions.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 italic">
                                    No transactions yet. Make your first transfer!
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {recentTransactions.map((txn) => {
                                        const isSender = userAccountIds.includes(
                                            txn.senderAccountId
                                        )
                                        return (
                                            <div
                                                key={txn.id}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`p-2 rounded-full ${isSender
                                                                ? "bg-red-500/10 text-red-400"
                                                                : "bg-green-500/10 text-green-400"
                                                            }`}
                                                    >
                                                        {isSender ? (
                                                            <ArrowUpRight className="w-4 h-4" />
                                                        ) : (
                                                            <ArrowDownLeft className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-medium">
                                                            {isSender
                                                                ? `To: ${txn.receiverAccount.user.fullName}`
                                                                : `From: ${txn.senderAccount.user.fullName}`}
                                                        </p>
                                                        <p className="text-slate-500 text-xs font-mono">
                                                            {txn.reference}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p
                                                    className={`font-bold ${isSender
                                                            ? "text-red-400"
                                                            : "text-green-400"
                                                        }`}
                                                >
                                                    {isSender ? "-" : "+"}
                                                    {formatCurrency(
                                                        txn.amount.toString(),
                                                        txn.currency as "USD" | "KHR"
                                                    )}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link
                                href="/transfer"
                                className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white group"
                            >
                                <div className="p-2 bg-blue-500/20 rounded text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                                <span>Send Money</span>
                            </Link>
                            <Link
                                href="/statements"
                                className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white group"
                            >
                                <div className="p-2 bg-green-500/20 rounded text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                    <ArrowDownLeft className="w-4 h-4" />
                                </div>
                                <span>Download Statement</span>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* ✅ Real KHQR Card */}
                    {usdAccount && (
                        <KHQRCard
                            accountNumber={usdAccount.accountNumber}
                            accountName={session.user.name ?? "Account Holder"}
                        />
                    )}
                </div>
            </div>

            <div className="mt-8">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-white">Spending Insights</h2>
                    <p className="text-slate-400 text-sm">Your financial activity over time</p>
                </div>
                <InsightsSection />
            </div>
        </div>
    )
}