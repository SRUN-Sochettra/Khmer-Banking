// app/(dashboard)/settings/page.tsx
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { CopyButton } from "@/components/ui/copy-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    User,
    Mail,
    Phone,
    Shield,
    Bell,
    CreditCard,
    ChevronRight,
    CheckCircle2,
} from "lucide-react"
import { maskAccountNumber, formatDate } from "@/lib/utils"

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    // ✅ Fetch full user data + accounts server-side
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            fullName: true,
            email: true,
            phone: true,
            isVerified: true,
            isTwoFAEnabled: true,
            createdAt: true,
            accounts: {
                select: {
                    id: true,
                    accountNumber: true,
                    accountType: true,
                    currency: true,
                    isActive: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "asc" },
            },
        },
    })

    if (!user) redirect("/login")

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-slate-400">
                    Manage your account details and preferences
                </p>
            </div>

            {/* ── Profile Info ──────────────────────────────────── */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        Profile Information
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Your personal account details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                    <InfoRow
                        icon={<User className="w-4 h-4 text-slate-400" />}
                        label="Full Name"
                        value={user.fullName}
                    />
                    <InfoRow
                        icon={<Mail className="w-4 h-4 text-slate-400" />}
                        label="Email Address"
                        value={user.email}
                        badge={
                            user.isVerified ? (
                                <span className="flex items-center gap-1 text-green-400 text-xs">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified
                                </span>
                            ) : (
                                <span className="text-amber-400 text-xs">
                                    Unverified
                                </span>
                            )
                        }
                    />
                    <InfoRow
                        icon={<Phone className="w-4 h-4 text-slate-400" />}
                        label="Phone Number"
                        value={user.phone}
                    />
                    <InfoRow
                        icon={<CreditCard className="w-4 h-4 text-slate-400" />}
                        label="Member Since"
                        value={formatDate(user.createdAt)}
                    />

                </CardContent>
            </Card>

            {/* ── Security Settings ─────────────────────────────── */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        Security
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Manage your account security preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">

                    <SecurityRow
                        label="Two-Factor Authentication"
                        description="OTP required for all transfers"
                        enabled={user.isTwoFAEnabled}
                    />
                    <SecurityRow
                        label="Email Verification"
                        description="Account verified via email OTP"
                        enabled={user.isVerified}
                    />

                    {/* Change Password — navigates to security page */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-700 rounded-lg">
                                <Shield className="w-4 h-4 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">
                                    Password
                                </p>
                                <p className="text-slate-500 text-xs">
                                    Last changed: unknown
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/security"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                        >
                            Change
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                </CardContent>
            </Card>

            {/* ── Linked Accounts ───────────────────────────────── */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-400" />
                        Linked Accounts
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Your active bank accounts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {user.accounts.map((account) => (
                        <div
                            key={account.id}
                            className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <CreditCard className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">
                                        {account.accountType} ·{" "}
                                        <span className="text-slate-400">
                                            {account.currency}
                                        </span>
                                    </p>
                                    <p className="text-slate-500 text-xs font-mono">
                                        {maskAccountNumber(account.accountNumber)} <CopyButton value={account.accountNumber} className="ml-1 opacity-50 hover:opacity-100" />
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                                    account.isActive
                                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                            >
                                {account.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* ── Notifications ─────────────────────────────────── */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-400" />
                        Notifications
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        How we contact you
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <SecurityRow
                        label="Transfer OTP Emails"
                        description="Receive OTP codes for every transfer"
                        enabled={true}
                    />
                    <SecurityRow
                        label="Login Alerts"
                        description="Email notification on new login"
                        enabled={true}
                    />
                    <SecurityRow
                        label="Statement Ready"
                        description="Notify when monthly statement is available"
                        enabled={false}
                    />
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        Theme Settings
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Manage your application theme
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-white text-sm font-medium">Dark Mode</p>
                                <p className="text-slate-500 text-xs">Toggle application theme</p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}

// ─── Sub Components ───────────────────────────────────────────

function InfoRow({
    icon,
    label,
    value,
    badge,
}: {
    icon: React.ReactNode
    label: string
    value: string
    badge?: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700 rounded-lg">{icon}</div>
                <div>
                    <p className="text-slate-400 text-xs">{label}</p>
                    <p className="text-white text-sm font-medium">{value}</p>
                </div>
            </div>
            {badge && <div>{badge}</div>}
        </div>
    )
}

function SecurityRow({
    label,
    description,
    enabled,
}: {
    label: string
    description: string
    enabled: boolean
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3">
                <div
                    className={`p-2 rounded-lg ${
                        enabled ? "bg-green-500/10" : "bg-slate-700"
                    }`}
                >
                    <Shield
                        className={`w-4 h-4 ${
                            enabled ? "text-green-400" : "text-slate-500"
                        }`}
                    />
                </div>
                <div>
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-slate-500 text-xs">{description}</p>
                </div>
            </div>
            <span
                className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                    enabled
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-slate-700 text-slate-500 border-slate-600"
                }`}
            >
                {enabled ? "On" : "Off"}
            </span>
        </div>
    )
}