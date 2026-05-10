"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    ShieldCheck,
    History,
    Globe,
    Clock,
    AlertTriangle,
    Lock,
    ChevronRight,
} from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

// ✅ Proper type instead of any
type AuditLog = {
    id: string
    action: string
    ipAddress: string | null
    createdAt: string
    metadata: Record<string, unknown> | null
}

export default function SecurityPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch("/api/security/audit-logs")
            .then((res) => res.json())
            .then((res) => {
                setLogs(res.data.logs)
                setIsLoading(false)
            })
    }, [])

    const getActionColor = (action: string) => {
        if (action.includes("FAILED")) return "text-red-400"
        if (action.includes("TRANSFER")) return "text-blue-400"
        if (action.includes("LOGIN")) return "text-green-400"
        return "text-slate-400"
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Security Center</h1>
                <p className="text-slate-400">
                    Manage your account security and monitor activity
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                Protection Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                <div className="text-sm">
                                    <p className="text-white font-medium">
                                        Two-Factor Auth
                                    </p>
                                    <p className="text-slate-400 text-xs">
                                        Required for transfers
                                    </p>
                                </div>
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                    Active
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                <div className="text-sm">
                                    <p className="text-white font-medium">
                                        Session Encryption
                                    </p>
                                    <p className="text-slate-400 text-xs">
                                        AES-256 Bit
                                    </p>
                                </div>
                                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                    Secure
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">
                                Security Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors group text-left">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                                    <span className="text-sm text-slate-200">
                                        Change Password
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors group text-left">
                                <div className="flex items-center gap-3 text-red-400">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        Deactivate Account
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Audit Logs */}
                <div className="lg:col-span-2">
                    <Card className="bg-slate-900 border-slate-800 h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <History className="w-5 h-5 text-blue-400" />
                                    Audit History
                                </CardTitle>
                                <CardDescription>
                                    Real-time log of account activity
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="py-20 text-center text-slate-500">
                                    Loading logs...
                                </div>
                            ) : (
                                <ScrollArea className="h-125 pr-4">
                                    <div className="space-y-6">
                                        {logs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="relative pl-6 border-l border-slate-800 pb-6 last:pb-0"
                                            >
                                                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div>
                                                        <p className={cn(
                                                            "text-sm font-bold uppercase tracking-wider",
                                                            getActionColor(log.action)
                                                        )}>
                                                            {log.action.replace(/_/g, " ")}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDate(log.createdAt)}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                                <Globe className="w-3 h-3" />
                                                                {log.ipAddress ?? "Unknown IP"}
                                                            </span>
                                                        </div>
                                                        {log.metadata && (
                                                            <pre className="mt-2 p-2 bg-slate-950 rounded text-[10px] text-slate-500 font-mono overflow-x-auto">
                                                                {JSON.stringify(log.metadata, null, 2)}
                                                            </pre>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}