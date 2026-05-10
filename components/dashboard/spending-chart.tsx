// components/dashboard/spending-chart.tsx
"use client"

import { useMemo } from "react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

type Transaction = {
    id: string
    amount: string
    currency: string
    createdAt: Date | string
    isSender: boolean
}

// ✅ Recharts-safe formatter type
type TooltipValue = string | number | (string | number)[]

// ─── Shared formatter helper ─────────────────────────────────
function makeFormatter(currency: string) {
    return (amount: number) =>
        currency === "KHR"
            ? `₭${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
            : `$${amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })}`
}

// ─── Area Chart — 6 Month Flow ───────────────────────────────
export function SpendingFlowChart({
    transactions,
    currency = "USD",
}: {
    transactions: Transaction[]
    currency?: string
}) {
    // ✅ formatValue is defined in scope where it's used
    const formatValue = makeFormatter(currency)

    const data = useMemo(() => {
        const now = new Date()
        const months: Record<
            string,
            { month: string; sent: number; received: number }
        > = {}

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const key = `${d.getFullYear()}-${d.getMonth()}`
            const label = d.toLocaleString("default", { month: "short" })
            months[key] = { month: label, sent: 0, received: 0 }
        }

        transactions
            .filter((t) => t.currency === currency)
            .forEach((txn) => {
                const d = new Date(txn.createdAt)
                const key = `${d.getFullYear()}-${d.getMonth()}`
                if (!months[key]) return
                const amount = parseFloat(txn.amount)
                if (txn.isSender) {
                    months[key].sent += amount
                } else {
                    months[key].received += amount
                }
            })

        return Object.values(months)
    }, [transactions, currency])

    const totalSent = data.reduce((s, d) => s + d.sent, 0)
    const totalReceived = data.reduce((s, d) => s + d.received, 0)

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                        6-Month Cash Flow
                        <span className="ml-2 text-sm text-slate-400 font-normal">
                            ({currency})
                        </span>
                    </CardTitle>
                </div>

                <div className="flex gap-6 pt-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <div>
                            <p className="text-slate-500 text-xs">Total In</p>
                            <p className="text-green-400 font-bold text-sm">
                                {formatValue(totalReceived)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <div>
                            <p className="text-slate-500 text-xs">Total Out</p>
                            <p className="text-red-400 font-bold text-sm">
                                {formatValue(totalSent)}
                            </p>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs">Net</p>
                        <p className={`font-bold text-sm ${
                            totalReceived - totalSent >= 0
                                ? "text-blue-400"
                                : "text-amber-400"
                        }`}>
                            {formatValue(totalReceived - totalSent)}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id="receivedGrad"
                                x1="0" y1="0" x2="0" y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#22c55e"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#22c55e"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="sentGrad"
                                x1="0" y1="0" x2="0" y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#ef4444"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#ef4444"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                        />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: "#64748b", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) =>
                                currency === "KHR"
                                    ? `₭${(v / 1000).toFixed(0)}k`
                                    : `$${v}`
                            }
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#0f172a",
                                border: "1px solid #1e293b",
                                borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#94a3b8" }}
                            // ✅ Properly typed — no any
                            formatter={(
                                value: TooltipValue,
                                name: string
                            ): [string, string] => {
                                const num =
                                    typeof value === "number"
                                        ? value
                                        : parseFloat(String(value))
                                return [
                                    formatValue(isNaN(num) ? 0 : num),
                                    name === "received"
                                        ? "Money In"
                                        : "Money Out",
                                ]
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="received"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fill="url(#receivedGrad)"
                        />
                        <Area
                            type="monotone"
                            dataKey="sent"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fill="url(#sentGrad)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

// ─── Bar Chart — 14 Day Spending ─────────────────────────────
export function MonthlyBreakdownChart({
    transactions,
    currency = "USD",
}: {
    transactions: Transaction[]
    currency?: string
}) {
    // ✅ formatValue in scope
    const formatValue = makeFormatter(currency)

    const data = useMemo(() => {
        const now = new Date()
        const days: Record<string, { day: string; amount: number }> = {}

        for (let i = 13; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            const key = d.toISOString().slice(0, 10)
            days[key] = {
                day: d.toLocaleString("default", {
                    weekday: "short",
                    day: "numeric",
                }),
                amount: 0,
            }
        }

        transactions
            .filter((t) => t.currency === currency && t.isSender)
            .forEach((txn) => {
                const key = new Date(txn.createdAt)
                    .toISOString()
                    .slice(0, 10)
                if (!days[key]) return
                days[key].amount += parseFloat(txn.amount)
            })

        return Object.values(days)
    }, [transactions, currency])

    const max = Math.max(...data.map((d) => d.amount), 1)

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white">
                    14-Day Spending
                    <span className="ml-2 text-sm text-slate-400 font-normal">
                        ({currency})
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="day"
                            tick={{ fill: "#64748b", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            interval={1}
                        />
                        <YAxis
                            tick={{ fill: "#64748b", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) =>
                                currency === "KHR" ? `₭${v}` : `$${v}`
                            }
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#0f172a",
                                border: "1px solid #1e293b",
                                borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#94a3b8" }}
                            // ✅ Properly typed — no any
                            formatter={(
                                value: TooltipValue
                            ): [string, string] => {
                                const num =
                                    typeof value === "number"
                                        ? value
                                        : parseFloat(String(value))
                                return [
                                    formatValue(isNaN(num) ? 0 : num),
                                    "Spent",
                                ]
                            }}
                        />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={
                                        entry.amount === max && max > 0
                                            ? "#3b82f6"
                                            : entry.amount > max * 0.6
                                            ? "#6366f1"
                                            : "#1e40af"
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}