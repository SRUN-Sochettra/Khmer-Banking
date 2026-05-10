// app/(auth)/forgot-password/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Building2, Loader2, ArrowLeft, MailCheck, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

const ForgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [submittedEmail, setSubmittedEmail] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(ForgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordInput) => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/forget-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (!result.success) {
                toast.error(result.message)
                return
            }

            setSubmittedEmail(data.email)
            setIsSubmitted(true)
            toast.success(result.message)

            // ✅ Add this line so reset page knows the email
            sessionStorage.setItem("resetEmail", data.email)
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="bg-blue-500 p-2 rounded-lg">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-2xl font-bold">KhmerBank</span>
                </div>

                {isSubmitted ? (
                    /* ── Success State ─────────────────────────────── */
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardContent className="pt-10 pb-8 text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="bg-green-500/20 p-4 rounded-full">
                                    <MailCheck className="w-10 h-10 text-green-400" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Check your email
                                </h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    If an account exists for{" "}
                                    <span className="text-blue-400 font-medium">
                                        {submittedEmail}
                                    </span>
                                    , we&apos;ve sent password reset instructions.
                                </p>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                                <p className="text-amber-400 text-sm flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 shrink-0" />
                                    For security, this link expires in 15 minutes.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Button
                                    onClick={() => setIsSubmitted(false)}
                                    variant="outline"
                                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    Try different email
                                </Button>
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* ── Form State ────────────────────────────────── */
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-white">
                                Forgot password?
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Enter your email and we&apos;ll send you reset instructions.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-slate-200"
                                    >
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="sokha@example.com"
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                        {...register("email")}
                                    />
                                    {errors.email && (
                                        <p className="text-red-400 text-sm">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>

                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 text-sm mt-4"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </Link>
                            </form>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    )
}