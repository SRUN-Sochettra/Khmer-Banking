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
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account details and preferences
                </p>
            </div>

            {/* ── Profile Info ──────────────────────────────────── */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Profile Information
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Your personal account details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                    <InfoRow
                        icon={<User className="w-4 h-4 text-muted-foreground" />}
                        label="Full Name"
                        value={user.fullName}
                    />
                    <InfoRow
                        icon={<Mail className="w-4 h-4 text-muted-foreground" />}
                        label="Email Address"
                        value={user.email}
                        badge={
                            user.isVerified ? (
                                <span className="flex items-center gap-1 text-primary text-xs">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified
                                </span>
                            ) : (
                                <span className="text-accent text-xs">
                                    Unverified
                                </span>
                            )
                        }
                    />
                    <InfoRow
                        icon={<Phone className="w-4 h-4 text-muted-foreground" />}
                        label="Phone Number"
                        value={user.phone}
                    />
                    <InfoRow
                        icon={<CreditCard className="w-4 h-4 text-muted-foreground" />}
                        label="Member Since"
                        value={formatDate(user.createdAt)}
                    />

                </CardContent>
            </Card>

            {/* ── Security Settings ─────────────────────────────── */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Security
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
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
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-input/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                                <Shield className="w-4 h-4 text-foreground" />
                            </div>
                            <div>
                                <p className="text-foreground text-sm font-medium">
                                    Password
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    Last changed: unknown
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/security"
                            className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium transition-colors"
                        >
                            Change
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                </CardContent>
            </Card>

            {/* ── Linked Accounts ───────────────────────────────── */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Linked Accounts
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Your active bank accounts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {user.accounts.map((account) => (
                        <div
                            key={account.id}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-input/50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-foreground text-sm font-medium">
                                        {account.accountType} ·{" "}
                                        <span className="text-muted-foreground">
                                            {account.currency}
                                        </span>
                                    </p>
                                    <p className="text-muted-foreground text-xs font-mono">
                                        {maskAccountNumber(account.accountNumber)} <CopyButton value={account.accountNumber} className="ml-1 opacity-50 hover:opacity-100" />
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                                    account.isActive
                                        ? "bg-primary/10 text-primary border-border"
                                        : "bg-destructive/10 text-destructive border-border"
                                }`}
                            >
                                {account.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* ── Notifications ─────────────────────────────────── */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <Bell className="w-5 h-5 text-accent" />
                        Notifications
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
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

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        Theme Settings
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Manage your application theme
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-input/50">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-foreground text-sm font-medium">Dark Mode</p>
                                <p className="text-muted-foreground text-xs">Toggle application theme</p>
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
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-input/50">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">{icon}</div>
                <div>
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="text-foreground text-sm font-medium">{value}</p>
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
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-input/50">
            <div className="flex items-center gap-3">
                <div
                    className={`p-2 rounded-lg ${
                        enabled ? "bg-primary/10" : "bg-muted"
                    }`}
                >
                    <Shield
                        className={`w-4 h-4 ${
                            enabled ? "text-primary" : "text-muted-foreground"
                        }`}
                    />
                </div>
                <div>
                    <p className="text-foreground text-sm font-medium">{label}</p>
                    <p className="text-muted-foreground text-xs">{description}</p>
                </div>
            </div>
            <span
                className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                    enabled
                        ? "bg-primary/10 text-primary border-border"
                        : "bg-muted text-muted-foreground border-input"
                }`}
            >
                {enabled ? "On" : "Off"}
            </span>
        </div>
    )
}