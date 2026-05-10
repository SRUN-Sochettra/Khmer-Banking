// proxy.ts  (was middleware.ts)

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const PUBLIC_ROUTES = ["/login", "/register", "/verify-otp"]
const AUTH_ROUTES = ["/login", "/register"]

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname)
    const isAuthRoute = AUTH_ROUTES.includes(nextUrl.pathname)

    if (isLoggedIn && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}