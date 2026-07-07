"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    ArrowRightLeft,
    History,
    FileText,
    ShieldCheck,
    Settings,
    LogOut,
    Building2,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const routes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Transfer", icon: ArrowRightLeft, href: "/transfer" },
    { label: "Transactions", icon: History, href: "/transactions" },
    { label: "Statements", icon: FileText, href: "/statements" },
    { label: "Security", icon: ShieldCheck, href: "/security" },
    { label: "Settings", icon: Settings, href: "/settings" },
]

export function Sidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()

    return (
        <div className="flex flex-col h-full bg-card text-foreground w-64 border-r border-border">
            <div className="p-6 flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-primary-foreground">KhmerBank</span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                            pathname === route.href
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <route.icon className={cn(
                            "w-5 h-5",
                            pathname === route.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        <span className="font-medium">{route.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-border space-y-4">
                {/* User Profile Summary */}
                {session?.user && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
                        <Avatar>
                            <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ""} />
                            <AvatarFallback>{session.user.name?.charAt(0) ?? "U"}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-foreground truncate">
                                {session.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {session.user.email}
                            </p>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    )
}
