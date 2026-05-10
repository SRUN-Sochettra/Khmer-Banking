// components/dashboard/insights-section.tsx
"use client"

import { useEffect, useState } from "react"
import { SpendingFlowChart, MonthlyBreakdownChart } from "./spending-chart"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type InsightStats = {
    totalSentUSD: number
    totalReceivedUSD: number
    totalTransactions: number
    thisMonthSpend: number
    lastMonthSpend: number
    spendingChange: number | null
}

type Transaction = {
    id: string
    amount: string
    currency: string
    createdAt: string
    isSender: boolean
}

export function InsightsSection() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [stats, setStats] = useState<InsightStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currency, setCurrency] = useState<"USD" | "KHR">("USD")

    useEffect(() => {
        fetch("/api/dashboard/insights")
            .then((r) => r.json())
            .then((res) => {
                if (res.success) {
                    setTransactions(res.data.transactions)
                    setStats(res.data.stats)
                }
            })
            .finally(() => setIsLoading(false))
    }, [])

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-80 w-full bg-slate-800" />
                <Skeleton className="h-70 w-full bg-slate-800" />
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* ── Stat Cards ─────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Sent (6mo)"
                    value={`$${stats?.totalSentUSD.toFixed(2) ?? "0.00"}`}
                    icon={<TrendingDown className="w-4 h-4 text-red-400" />}
                    color="red"
                />
                <StatCard
                    label="Total Received (6mo)"
                    value={`$${stats?.totalReceivedUSD.toFixed(2) ?? "0.00"}`}
                    icon={<TrendingUp className="w-4 h-4 text-green-400" />}
                    color="green"
                />
                <StatCard
                    label="This Month"
                    value={`$${stats?.thisMonthSpend.toFixed(2) ?? "0.00"}`}
                    icon={<Activity className="w-4 h-4 text-blue-400" />}
                    color="blue"
                    subtext={
                        stats?.spendingChange != null
                            ? `${stats.spendingChange > 0 ? "+" : ""}${stats.spendingChange.toFixed(1)}% vs last month`
                            : "First month of data"
                    }
                    subtextColor={
                        stats?.spendingChange == null
                            ? "slate"
                            : stats.spendingChange > 0
                            ? "red"
                            : "green"
                    }
                />
                <StatCard
                    label="Total Transactions"
                    value={`${stats?.totalTransactions ?? 0}`}
                    icon={<Minus className="w-4 h-4 text-purple-400" />}
                    color="purple"
                    subtext="Last 6 months"
                    subtextColor="slate"
                />
            </div>

            {/* ── Currency Toggle ─────────────────────────────── */}
            <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">View in:</span>
                {(["USD", "KHR"] as const).map((cur) => (
                    <button
                        key={cur}
                        onClick={() => setCurrency(cur)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            currency === cur
                                ? "bg-blue-600 text-white"
                                : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                    >
                        {cur}
                    </button>
                ))}
            </div>

            {/* ── Charts ─────────────────────────────────────── */}
            <SpendingFlowChart
                transactions={transactions}
                currency={currency}
            />
            <MonthlyBreakdownChart
                transactions={transactions}
                currency={currency}
            />
        </div>
    )
}

function StatCard({
    label,
    value,
    icon,
    color,
    subtext,
    subtextColor = "slate",
}: {
    label: string
    value: string
    icon: React.ReactNode
    color: "red" | "green" | "blue" | "purple"
    subtext?: string
    subtextColor?: "red" | "green" | "slate"
}) {
    const bgColors = {
        red: "bg-red-500/10",
        green: "bg-green-500/10",
        blue: "bg-blue-500/10",
        purple: "bg-purple-500/10",
    }

    const textColors = {
        red: "text-red-400",
        green: "text-green-400",
        slate: "text-slate-500",
    }

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-5 pb-5">
                <div className={`w-8 h-8 ${bgColors[color]} rounded-lg flex items-center justify-center mb-3`}>
                    {icon}
                </div>
                <p className="text-slate-400 text-xs mb-1">{label}</p>
                <p className="text-white font-bold text-xl">{value}</p>
                {subtext && (
                    <p className={`text-xs mt-1 ${textColors[subtextColor]}`}>
                        {subtext}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}