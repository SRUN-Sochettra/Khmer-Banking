// lib/auth.ts

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"

// ✅ Define LoginSchema inline to avoid the missing module error
const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(db),

    session: {
        strategy: "jwt",
        maxAge: 30 * 60,
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    providers: [
        Credentials({
            async authorize(credentials) {
                const parsed = LoginSchema.safeParse(credentials)
                if (!parsed.success) return null

                const { email, password } = parsed.data

                const user = await db.user.findUnique({
                    where: { email },
                })

                if (!user || !user.passwordHash) return null

                const passwordMatch = await bcrypt.compare(
                    password,
                    user.passwordHash
                )
                if (!passwordMatch) return null

                if (!user.isVerified) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
            }
            return session
        },
    },

    events: {
        async signIn({ user }) {
            if (!user.id) return
            try {
                await db.auditLog.create({
                    data: {
                        userId: user.id,
                        action: "LOGIN",
                        metadata: { timestamp: new Date().toISOString() },
                    },
                })
            } catch (error) {
                console.error("[AUDIT_LOGIN_ERROR]", error)
            }
        },

        // ✅ Fix: use session shape, not token shape
        async signOut(message) {
            try {
                const userId =
                    "token" in message
                        ? (message.token?.id as string | undefined)
                        : undefined

                if (!userId) return

                await db.auditLog.create({
                    data: {
                        userId,
                        action: "LOGOUT",
                        metadata: { timestamp: new Date().toISOString() },
                    },
                })
            } catch (error) {
                console.error("[AUDIT_LOGOUT_ERROR]", error)
            }
        },
    },
})