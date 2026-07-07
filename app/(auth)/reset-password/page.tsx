"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
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
import {
    Building2,
    Loader2,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowLeft,
    ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"

const OtpStepSchema = z.object({
    code: z
        .string()
        .length(6, "OTP must be 6 digits")
        .regex(/^[0-9]+$/, "Numbers only"),
})

const PasswordStepSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number")
            .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

type OtpStepInput = z.infer<typeof OtpStepSchema>
type PasswordStepInput = z.infer<typeof PasswordStepSchema>
type Step = "OTP" | "PASSWORD" | "SUCCESS"

// ✅ Inner component reads searchParams — wrapped in Suspense below
function ResetPasswordInner() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // ✅ Read directly — no setState in effect
    const emailFromQuery = searchParams.get("email") ?? ""
    const emailFromStorage =
        typeof window !== "undefined"
            ? (sessionStorage.getItem("resetEmail") ?? "")
            : ""
    const email = emailFromQuery || emailFromStorage

    const [step, setStep] = useState<Step>("OTP")
    const [verifiedCode, setVerifiedCode] = useState("")
    const [userId, setUserId] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const otpForm = useForm<OtpStepInput>({
        resolver: zodResolver(OtpStepSchema),
    })

    const passwordForm = useForm<PasswordStepInput>({
        resolver: zodResolver(PasswordStepSchema),
    })

    // ✅ Redirect without setState in effect
    if (!email) {
        router.push("/forgot-password")
        return null
    }

    const handleVerifyOtp = async (data: OtpStepInput) => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/reset-password/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: data.code }),
            })
            const result = await res.json()

            if (!result.success) {
                toast.error(result.message)
                return
            }

            setVerifiedCode(data.code)
            setUserId(result.data.userId)
            setStep("PASSWORD")
            toast.success("Code verified! Set your new password.")
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (data: PasswordStepInput) => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    code: verifiedCode,
                    newPassword: data.password,
                }),
            })
            const result = await res.json()

            if (!result.success) {
                toast.error(result.message)
                return
            }

            sessionStorage.removeItem("resetEmail")
            setStep("SUCCESS")
            toast.success("Password reset successfully!")
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="bg-primary p-2 rounded-lg">
                        <Building2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-primary-foreground text-2xl font-bold">KhmerBank</span>
                </div>

                {/* ── Step: OTP ───────────────────────────────── */}
                {step === "OTP" && (
                    <Card className="border-input bg-muted/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-2xl text-foreground">
                                Enter reset code
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Enter the 6-digit code sent to{" "}
                                <span className="text-primary">{email}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        Verification Code
                                    </Label>
                                    <Input
                                        placeholder="000000"
                                        maxLength={6}
                                        className="bg-muted border-input text-foreground text-center text-2xl font-bold tracking-widest placeholder:text-muted-foreground"
                                        {...otpForm.register("code")}
                                    />
                                    {otpForm.formState.errors.code && (
                                        <p className="text-destructive text-sm">
                                            {otpForm.formState.errors.code.message}
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
                                            Verifying...
                                        </>
                                    ) : (
                                        "Verify Code"
                                    )}
                                </Button>

                                <Link
                                    href="/forgot-password"
                                    className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm mt-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Request new code
                                </Link>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* ── Step: New Password ──────────────────────── */}
                {step === "PASSWORD" && (
                    <Card className="border-input bg-muted/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-2xl text-foreground">
                                Set new password
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Choose a strong password for your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={passwordForm.handleSubmit(handleResetPassword)}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min 8 chars, uppercase & symbol"
                                            className="bg-muted border-input text-foreground placeholder:text-muted-foreground pr-10"
                                            {...passwordForm.register("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword
                                                ? <EyeOff className="w-4 h-4" />
                                                : <Eye className="w-4 h-4" />
                                            }
                                        </button>
                                    </div>
                                    {passwordForm.formState.errors.password && (
                                        <p className="text-destructive text-sm">
                                            {passwordForm.formState.errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Re-enter password"
                                            className="bg-muted border-input text-foreground placeholder:text-muted-foreground pr-10"
                                            {...passwordForm.register("confirmPassword")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showConfirm
                                                ? <EyeOff className="w-4 h-4" />
                                                : <Eye className="w-4 h-4" />
                                            }
                                        </button>
                                    </div>
                                    {passwordForm.formState.errors.confirmPassword && (
                                        <p className="text-destructive text-sm">
                                            {passwordForm.formState.errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 bg-primary/10 border border-border rounded-lg p-3">
                                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                                    <p className="text-primary/80 text-xs">
                                        All active sessions will be logged out after reset.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Resetting...
                                        </>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* ── Step: Success ───────────────────────────── */}
                {step === "SUCCESS" && (
                    <Card className="border-input bg-muted/50 backdrop-blur">
                        <CardContent className="pt-10 pb-8 text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="bg-primary/20 p-5 rounded-full">
                                    <CheckCircle2 className="w-12 h-12 text-primary" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    Password Reset!
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Your password has been changed successfully.
                                    You can now sign in with your new password.
                                </p>
                            </div>
                            <Button
                                onClick={() => router.push("/login")}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                            >
                                Sign In Now
                            </Button>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    )
}

// ✅ Wrap in Suspense — required when using useSearchParams in client component
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        }>
            <ResetPasswordInner />
        </Suspense>
    )
}