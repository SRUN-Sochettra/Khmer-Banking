// app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/dashboard/sidebar"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) redirect("/login")

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/50 backdrop-blur">
                    <h2 className="text-muted-foreground text-sm font-medium">
                        Welcome back, <span className="text-foreground">{session.user.name}</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full border border-border uppercase font-bold tracking-wider">
                            Secure Session Active
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}