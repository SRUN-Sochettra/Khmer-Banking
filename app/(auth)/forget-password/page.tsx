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
                    <div className="bg-primary p-2 rounded-lg">
                        <Building2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-primary-foreground text-2xl font-bold">KhmerBank</span>
                </div>

                {isSubmitted ? (
                    /* ── Success State ─────────────────────────────── */
                    <Card className="border-input bg-muted/50 backdrop-blur">
                        <CardContent className="pt-10 pb-8 text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="bg-primary/20 p-4 rounded-full">
                                    <MailCheck className="w-10 h-10 text-primary" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    Check your email
                                </h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    If an account exists for{" "}
                                    <span className="text-primary font-medium">
                                        {submittedEmail}
                                    </span>
                                    , we&apos;ve sent password reset instructions.
                                </p>
                            </div>

                            <div className="bg-accent/10 border border-border rounded-lg p-4">
                                <p className="text-accent text-sm flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 shrink-0" />
                                    For security, this link expires in 15 minutes.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Button
                                    onClick={() => setIsSubmitted(false)}
                                    variant="outline"
                                    className="w-full border-input text-foreground hover:bg-muted"
                                >
                                    Try different email
                                </Button>
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* ── Form State ────────────────────────────────── */
                    <Card className="border-input bg-muted/50 backdrop-blur">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl text-foreground">
                                Forgot password?
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
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
                                        className="text-foreground"
                                    >
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="sokha@example.com"
                                        className="bg-muted border-input text-foreground placeholder:text-muted-foreground"
                                        {...register("email")}
                                    />
                                    {errors.email && (
                                        <p className="text-destructive text-sm">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
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
                                    className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm mt-4"
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