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
                <Skeleton className="h-80 w-full bg-muted" />
                <Skeleton className="h-72 w-full bg-muted" />
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
                    icon={<TrendingDown className="w-4 h-4 text-destructive" />}
                    color="red"
                />
                <StatCard
                    label="Total Received (6mo)"
                    value={`$${stats?.totalReceivedUSD.toFixed(2) ?? "0.00"}`}
                    icon={<TrendingUp className="w-4 h-4 text-primary" />}
                    color="green"
                />
                <StatCard
                    label="This Month"
                    value={`$${stats?.thisMonthSpend.toFixed(2) ?? "0.00"}`}
                    icon={<Activity className="w-4 h-4 text-primary" />}
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
                    icon={<Minus className="w-4 h-4 text-primary" />}
                    color="purple"
                    subtext="Last 6 months"
                    subtextColor="slate"
                />
            </div>

            {/* ── Currency Toggle ─────────────────────────────── */}
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">View in:</span>
                {(["USD", "KHR"] as const).map((cur) => (
                    <button
                        key={cur}
                        onClick={() => setCurrency(cur)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            currency === cur
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
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
        red: "bg-destructive/10",
        green: "bg-primary/10",
        blue: "bg-primary/10",
        purple: "bg-primary/10",
    }

    const textColors = {
        red: "text-destructive",
        green: "text-primary",
        slate: "text-muted-foreground",
    }

    return (
        <Card className="bg-card border-border">
            <CardContent className="pt-5 pb-5">
                <div className={`w-8 h-8 ${bgColors[color]} rounded-lg flex items-center justify-center mb-3`}>
                    {icon}
                </div>
                <p className="text-muted-foreground text-xs mb-1">{label}</p>
                <p className="text-foreground font-bold text-xl">{value}</p>
                {subtext && (
                    <p className={`text-xs mt-1 ${textColors[subtextColor]}`}>
                        {subtext}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}