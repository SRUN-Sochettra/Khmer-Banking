// components/dashboard/sidebar.tsx
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
    Building2
} from "lucide-react"
import { signOut } from "next-auth/react"

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

    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
            <div className="p-6 flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">KhmerBank</span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                            pathname === route.href
                                ? "bg-blue-600/10 text-blue-400"
                                : "hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <route.icon className={cn(
                            "w-5 h-5",
                            pathname === route.href ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                        )} />
                        <span className="font-medium">{route.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    )
}