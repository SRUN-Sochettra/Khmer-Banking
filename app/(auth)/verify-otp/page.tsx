// app/(auth)/verify-otp/page.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Building2, Loader2, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function VerifyOtpPage() {
    const router = useRouter()
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [countdown, setCountdown] = useState(60)
    const [canResend, setCanResend] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const email = typeof window !== "undefined"
        ? sessionStorage.getItem("pendingEmail") ?? ""
        : ""

    // ─── Countdown Timer ─────────────────────────────────────
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCanResend(true)
        }
    }, [countdown])

    // ─── OTP Input Handler ───────────────────────────────────
    const handleChange = (index: number, value: string) => {
        // Only allow single digit
        if (value.length > 1) return
        if (!/^[0-9]*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // On backspace, go to previous input
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").slice(0, 6)
        if (!/^[0-9]+$/.test(pasted)) return

        const newOtp = [...otp]
        pasted.split("").forEach((char, i) => {
            if (i < 6) newOtp[i] = char
        })
        setOtp(newOtp)
        inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }

    // ─── Submit ──────────────────────────────────────────────
    const handleSubmit = async () => {
        const code = otp.join("")
        if (code.length !== 6) {
            toast.error("Please enter the complete 6-digit code")
            return
        }

        const userId = sessionStorage.getItem("pendingUserId")
        if (!userId) {
            toast.error("Session expired. Please register again.")
            router.push("/register")
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, code }),
            })

            const result = await res.json()

            if (!result.success) {
                toast.error(result.message)
                setOtp(["", "", "", "", "", ""])
                inputRefs.current[0]?.focus()
                return
            }

            // Clear session storage
            sessionStorage.removeItem("pendingUserId")
            sessionStorage.removeItem("pendingEmail")

            toast.success(result.message)
            router.push("/login")
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // ─── Resend OTP ──────────────────────────────────────────
    const handleResend = async () => {
        setIsResending(true)
        try {
            const userId = sessionStorage.getItem("pendingUserId")
            if (!userId) {
                toast.error("Session expired. Please register again.")
                router.push("/register")
                return
            }
            const res = await fetch("/api/auth/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            })

            const result = await res.json()

            if (!result.success) {
                toast.error(result.message)
                return
            }
            toast.success("A new code has been sent to your email")
            setCountdown(60)
            setCanResend(false)
            setOtp(["", "", "", "", "", ""])
        } catch {
            toast.error("Failed to resend code")
        } finally {
            setIsResending(false)
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

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-2">
                            <div className="bg-blue-500/20 p-4 rounded-full">
                                <MailCheck className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-white">Check your email</CardTitle>
                        <CardDescription className="text-slate-400">
                            We sent a 6-digit code to{" "}
                            <span className="text-blue-400 font-medium">
                                {email || "your email"}
                            </span>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">

                        {/* OTP Input */}
                        <div className="flex gap-3 justify-center">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg bg-slate-700 border-2 border-slate-600 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            ))}
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || otp.join("").length !== 6}
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

                        {/* Resend */}
                        <div className="text-center">
                            {canResend ? (
                                <button
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                >
                                    {isResending ? "Sending..." : "Resend code"}
                                </button>
                            ) : (
                                <p className="text-slate-400 text-sm">
                                    Resend code in{" "}
                                    <span className="text-blue-400 font-medium">{countdown}s</span>
                                </p>
                            )}
                        </div>

                    </CardContent>
                </Card>

            </div>
        </div>
    )
}