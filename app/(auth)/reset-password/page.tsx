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
                    <div className="bg-blue-500 p-2 rounded-lg">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-2xl font-bold">KhmerBank</span>
                </div>

                {/* ── Step: OTP ───────────────────────────────── */}
                {step === "OTP" && (
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white">
                                Enter reset code
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Enter the 6-digit code sent to{" "}
                                <span className="text-blue-400">{email}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label className="text-slate-200">
                                        Verification Code
                                    </Label>
                                    <Input
                                        placeholder="000000"
                                        maxLength={6}
                                        className="bg-slate-700 border-slate-600 text-white text-center text-2xl font-bold tracking-widest placeholder:text-slate-500"
                                        {...otpForm.register("code")}
                                    />
                                    {otpForm.formState.errors.code && (
                                        <p className="text-red-400 text-sm">
                                            {otpForm.formState.errors.code.message}
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
                                            Verifying...
                                        </>
                                    ) : (
                                        "Verify Code"
                                    )}
                                </Button>

                                <Link
                                    href="/forgot-password"
                                    className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 text-sm mt-2"
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
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white">
                                Set new password
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Choose a strong password for your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={passwordForm.handleSubmit(handleResetPassword)}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label className="text-slate-200">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min 8 chars, uppercase & symbol"
                                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                                            {...passwordForm.register("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showPassword
                                                ? <EyeOff className="w-4 h-4" />
                                                : <Eye className="w-4 h-4" />
                                            }
                                        </button>
                                    </div>
                                    {passwordForm.formState.errors.password && (
                                        <p className="text-red-400 text-sm">
                                            {passwordForm.formState.errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-200">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Re-enter password"
                                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                                            {...passwordForm.register("confirmPassword")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showConfirm
                                                ? <EyeOff className="w-4 h-4" />
                                                : <Eye className="w-4 h-4" />
                                            }
                                        </button>
                                    </div>
                                    {passwordForm.formState.errors.confirmPassword && (
                                        <p className="text-red-400 text-sm">
                                            {passwordForm.formState.errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                                    <p className="text-blue-300 text-xs">
                                        All active sessions will be logged out after reset.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardContent className="pt-10 pb-8 text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="bg-green-500/20 p-5 rounded-full">
                                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Password Reset!
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    Your password has been changed successfully.
                                    You can now sign in with your new password.
                                </p>
                            </div>
                            <Button
                                onClick={() => router.push("/login")}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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
                <div className="text-slate-400">Loading...</div>
            </div>
        }>
            <ResetPasswordInner />
        </Suspense>
    )
}