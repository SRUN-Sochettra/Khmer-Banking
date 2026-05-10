// app/api/security/audit-logs/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { errorResponse, successResponse } from "@/lib/utils"

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json(errorResponse("Unauthorized"), { status: 401 })

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get("page") ?? "1")
        const limit = 20
        const skip = (page - 1) * limit

        const [logs, total] = await Promise.all([
            db.auditLog.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            db.auditLog.count({ where: { userId: session.user.id } }),
        ])

        return NextResponse.json(successResponse({
            logs,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            }
        }))
    } catch (error) {
        return NextResponse.json(errorResponse("Failed to fetch logs"), { status: 500 })
    }
}