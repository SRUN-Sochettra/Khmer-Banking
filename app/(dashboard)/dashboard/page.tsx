import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { formatCurrency, maskAccountNumber } from "@/lib/utils"
import { CopyButton } from "@/components/ui/copy-button"
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

    const usdAccount = accounts.find((a: { currency: string; accountNumber: string; id: string; balance: { toString: () => string }; accountType: string }) => a.currency === "USD")

    // ✅ Fetch real recent transactions
    const userAccountIds = accounts.map((a: { id: string }) => a.id)

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

    const usdBalance = accounts.find((a: { currency: string; balance: { toNumber: () => number } }) => a.currency === "USD")?.balance.toNumber() ?? 0
    const khrBalance = accounts.find((a: { currency: string; balance: { toNumber: () => number } }) => a.currency === "KHR")?.balance.toNumber() ?? 0

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-card-foreground">Overview</h1>
                <p className="text-muted-foreground">Monitor your assets and recent activity</p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account: { id: string; accountType: string; currency: string; balance: { toString: () => string }; accountNumber: string }) => (
                    <Card
                        key={account.id}
                        className="bg-card border-border hover:border-blue-500/50 transition-colors"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {account.accountType} — {account.currency}
                            </CardTitle>
                            <Wallet className="w-4 h-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-card-foreground">
                                {formatCurrency(
                                    account.balance.toString(),
                                    account.currency as "USD" | "KHR"
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-mono">
                                {maskAccountNumber(account.accountNumber)} <CopyButton value={account.accountNumber} className="ml-1 opacity-50 hover:opacity-100" />
                            </p>
                        </CardContent>
                    </Card>
                ))}

                {/* Total Assets */}
                <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-white">
                            Total Assets (USD)
                        </CardTitle>
                        <CreditCard className="w-4 h-4 text-white" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-card-foreground">
                            {formatCurrency(usdBalance + khrBalance / 4100)}
                        </div>
                        <p className="text-xs text-white mt-1">
                            Approx. based on 1 USD = 4,100 KHR
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ✅ Real Recent Transactions */}
                <div className="lg:col-span-2">
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-card-foreground">Recent Transactions</CardTitle>
                            <Link
                                href="/transactions"
                                className="text-primary hover:text-primary/80 text-sm"
                            >
                                View all →
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentTransactions.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground italic">
                                    No transactions yet. Make your first transfer!
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {recentTransactions.map((txn: { senderAccountId: string; id: string; receiverAccount: { user: { fullName: string } }; senderAccount: { user: { fullName: string } }; reference: string; amount: { toString: () => string }; currency: string }) => {
                                        const isSender = userAccountIds.includes(
                                            txn.senderAccountId
                                        )
                                        return (
                                            <div
                                                key={txn.id}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`p-2 rounded-full ${isSender
                                                                ? "bg-destructive/10 text-destructive"
                                                                : "bg-primary/10 text-primary"
                                                            }`}
                                                    >
                                                        {isSender ? (
                                                            <ArrowUpRight className="w-4 h-4" />
                                                        ) : (
                                                            <ArrowDownLeft className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-card-foreground text-sm font-medium">
                                                            {isSender
                                                                ? `To: ${txn.receiverAccount.user.fullName}`
                                                                : `From: ${txn.senderAccount.user.fullName}`}
                                                        </p>
                                                        <p className="text-muted-foreground text-xs font-mono">
                                                            {txn.reference}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p
                                                    className={`font-bold ${isSender
                                                            ? "text-destructive"
                                                            : "text-primary"
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
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link
                                href="/transfer"
                                className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted-foreground transition-colors text-card-foreground group"
                            >
                                <div className="p-2 bg-primary/20 rounded text-primary group-hover:bg-primary group-hover:text-card-foreground transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                                <span>Send Money</span>
                            </Link>
                            <Link
                                href="/statements"
                                className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted-foreground transition-colors text-card-foreground group"
                            >
                                <div className="p-2 bg-primary/20 rounded text-primary group-hover:bg-primary group-hover:text-card-foreground transition-colors">
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
                    <h2 className="text-xl font-bold text-card-foreground">Spending Insights</h2>
                    <p className="text-muted-foreground text-sm">Your financial activity over time</p>
                </div>
                <InsightsSection />
            </div>
        </div>
    )
}