// app/(dashboard)/statements/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    FileText,
    Download,
    Loader2,
    CalendarDays,
    ShieldCheck,
    CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"

// ─── Constants ────────────────────────────────────────────────
const MONTHS = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 3 }, (_, i) => ({
    value: `${currentYear - i}`,
    label: `${currentYear - i}`,
}))

export default function StatementsPage() {
    const [month, setMonth] = useState(`${new Date().getMonth() + 1}`)
    const [year, setYear] = useState(`${currentYear}`)
    const [currency, setCurrency] = useState<"USD" | "KHR">("USD")
    const [isGenerating, setIsGenerating] = useState(false)
    const [lastDownloaded, setLastDownloaded] = useState<string | null>(null)

    const handleDownload = async () => {
        setIsGenerating(true)
        try {
            const params = new URLSearchParams({ month, year, currency })
            const res = await fetch(`/api/statements/generate?${params}`)

            if (!res.ok) {
                const error = await res.json()
                toast.error(error.error ?? "Failed to generate statement")
                return
            }

            // ─── Trigger File Download ──────────────────────────────
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `KhmerBank_Statement_${MONTHS.find(m => m.value === month)?.label}_${year}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)

            const label = `${MONTHS.find(m => m.value === month)?.label} ${year} (${currency})`
            setLastDownloaded(label)
            toast.success("Statement downloaded successfully!")
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Statements</h1>
                <p className="text-muted-foreground">
                    Download your official monthly bank statements as PDF
                </p>
            </div>

            {/* Main Card */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Generate Statement
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Select the period and currency for your statement
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">

                    {/* Period Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">Month</Label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger className="bg-muted border-input text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-muted border-input">
                                    {MONTHS.map((m) => (
                                        <SelectItem
                                            key={m.value}
                                            value={m.value}
                                            className="text-foreground hover:bg-muted"
                                        >
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground">Year</Label>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger className="bg-muted border-input text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-muted border-input">
                                    {YEARS.map((y) => (
                                        <SelectItem
                                            key={y.value}
                                            value={y.value}
                                            className="text-foreground hover:bg-muted"
                                        >
                                            {y.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Currency Selection */}
                    <div className="space-y-2">
                        <Label className="text-foreground">Account Currency</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {(["USD", "KHR"] as const).map((cur) => (
                                <button
                                    key={cur}
                                    onClick={() => setCurrency(cur)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${currency === cur
                                        ? "border-blue-500 bg-primary/10"
                                        : "border-input bg-muted hover:border-input"
                                        }`}
                                >
                                    <div className="text-xl mb-1">
                                        {cur === "USD" ? "🇺🇸" : "🇰🇭"}
                                    </div>
                                    <div className="font-bold text-foreground">{cur}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {cur === "USD" ? "US Dollar" : "Cambodian Riel"}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview Banner */}
                    <div className="bg-muted rounded-xl p-4 flex items-center gap-4">
                        <div className="bg-destructive/20 p-3 rounded-lg">
                            <FileText className="w-8 h-8 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <p className="text-foreground font-medium">
                                Statement_{MONTHS.find(m => m.value === month)?.label}_{year}.pdf
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {MONTHS.find(m => m.value === month)?.label} {year} · {currency} Account
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <CalendarDays className="w-3 h-3" />
                            PDF
                        </div>
                    </div>

                    {/* Last Downloaded */}
                    {lastDownloaded && (
                        <div className="flex items-center gap-2 text-primary text-sm bg-primary/10 border border-border rounded-lg p-3">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Last downloaded: <strong>{lastDownloaded}</strong></span>
                        </div>
                    )}

                    {/* Download Button */}
                    <Button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 text-base"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-5 w-5" />
                                Download Statement
                            </>
                        )}
                    </Button>

                </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                    icon={<ShieldCheck className="w-5 h-5 text-primary" />}
                    title="Secure & Official"
                    description="Statements are generated server-side and logged for compliance. Each download is recorded in your audit history."
                    color="green"
                />
                <InfoCard
                    icon={<FileText className="w-5 h-5 text-primary" />}
                    title="What's Included"
                    description="Opening & closing balance, all completed transactions, counterpart names, references, and period summary."
                    color="blue"
                />
            </div>

        </div>
    )
}

// ─── Sub Components ───────────────────────────────────────────
function InfoCard({
    icon,
    title,
    description,
    color,
}: {
    icon: React.ReactNode
    title: string
    description: string
    color: "green" | "blue"
}) {
    const colors = {
        green: "bg-primary/10 border-border",
        blue: "bg-primary/10 border-border",
    }

    return (
        <div className={`rounded-xl border p-4 space-y-2 ${colors[color]}`}>
            <div className="flex items-center gap-2">
                {icon}
                <h3 className="text-foreground font-medium text-sm">{title}</h3>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
        </div>
    )
}