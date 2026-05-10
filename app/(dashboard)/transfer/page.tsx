// app/(dashboard)/transfer/page.tsx
"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TransferSchema, type TransferInput } from "@/lib/validations"
import { useTransfer } from "@/hooks/use-transfer"
import { formatCurrency } from "@/lib/utils"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ArrowRightLeft,
    ShieldCheck,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Send,
} from "lucide-react"

export default function TransferPage() {
    const { state, isRequestingOtp, isTransferring, requestOtp, executeTransfer, reset } =
        useTransfer()
    const [otpCode, setOtpCode] = useState("")
    type TransferResult = {
        reference: string
        amount: number
        currency: "USD" | "KHR"
        receiverAccount: string
        newBalance: string
        completedAt: string
    }

    const [transferResult, setTransferResult] = useState<TransferResult | null>(null)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<TransferInput>({
        resolver: zodResolver(TransferSchema),
        defaultValues: {
            currency: "USD",
        },
    })

    const watchedAmount = watch("amount")
    const watchedCurrency = watch("currency")

    // ─── Step 1: Request OTP ──────────────────────────────────
    const handleRequestOtp = handleSubmit(async () => {
        await requestOtp()
    })

    // ─── Step 2: Execute Transfer ─────────────────────────────
    const handleTransfer = async () => {
        if (otpCode.length !== 6) return

        const values = getValues()
        const result = await executeTransfer({
            ...values,
            otpCode,
        })

        if (result) setTransferResult(result)
    }

    // ─── Success Screen ───────────────────────────────────────
    if (state === "SUCCESS" && transferResult) {
        return (
            <div className="max-w-lg mx-auto">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-10 pb-10 text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="bg-green-500/20 p-5 rounded-full">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white">Transfer Successful!</h2>
                            <p className="text-slate-400 mt-1">Your money is on its way.</p>
                        </div>

                        {/* Receipt */}
                        <div className="bg-slate-800 rounded-xl p-6 space-y-3 text-left">
                            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                Transaction Receipt
                            </h3>
                            <div className="space-y-3">
                                <ReceiptRow
                                    label="Reference"
                                    value={transferResult.reference}
                                    mono
                                />
                                <ReceiptRow
                                    label="Amount Sent"
                                    value={formatCurrency(
                                        transferResult.amount,
                                        transferResult.currency
                                    )}
                                    highlight
                                />
                                <ReceiptRow
                                    label="To Account"
                                    value={transferResult.receiverAccount}
                                    mono
                                />
                                <ReceiptRow
                                    label="New Balance"
                                    value={formatCurrency(
                                        transferResult.newBalance,
                                        transferResult.currency
                                    )}
                                />
                                <ReceiptRow
                                    label="Status"
                                    value="Completed ✓"
                                    success
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={reset}
                                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                New Transfer
                            </Button>
                            <Button
                                onClick={() => window.print()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                Save Receipt
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Send Money</h1>
                <p className="text-slate-400">Transfer funds securely to any KhmerBank account</p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
                <Step number={1} label="Transfer Details" active={state === "IDLE"} done={state !== "IDLE"} />
                <div className="flex-1 h-px bg-slate-800" />
                <Step number={2} label="Verify OTP" active={state === "OTP_SENT"} done={state === "SUCCESS"} />
                <div className="flex-1 h-px bg-slate-800" />
                <Step number={3} label="Done" active={state === "SUCCESS"} done={false} />
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                        Transfer Details
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter the recipient&apos;s account number and amount
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Receiver Account */}
                    <div className="space-y-2">
                        <Label className="text-slate-200">Recipient Account Number</Label>
                        <Input
                            placeholder="XXXX-XXXX-XXXX"
                            disabled={state === "OTP_SENT"}
                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 font-mono"
                            {...register("receiverAccountNumber")}
                        />
                        {errors.receiverAccountNumber && (
                            <ErrorMessage message={errors.receiverAccountNumber.message!} />
                        )}
                    </div>

                    {/* Amount + Currency Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-2">
                            <Label className="text-slate-200">Amount</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                disabled={state === "OTP_SENT"}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-lg font-semibold"
                                {...register("amount", { valueAsNumber: true })}
                            />
                            {errors.amount && (
                                <ErrorMessage message={errors.amount.message!} />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-200">Currency</Label>
                            <Select
                                defaultValue="USD"
                                disabled={state === "OTP_SENT"}
                                onValueChange={(val) => setValue("currency", val as "USD" | "KHR")}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="USD" className="text-white">🇺🇸 USD</SelectItem>
                                    <SelectItem value="KHR" className="text-white">🇰🇭 KHR</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Amount Preview */}
                    {watchedAmount > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-slate-400 text-sm">You are sending</p>
                            <p className="text-2xl font-bold text-blue-400">
                                {formatCurrency(watchedAmount, watchedCurrency)}
                            </p>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-slate-200">
                            Description{" "}
                            <span className="text-slate-500 font-normal">(Optional)</span>
                        </Label>
                        <Input
                            placeholder="e.g. Rent for January"
                            disabled={state === "OTP_SENT"}
                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                            {...register("description")}
                        />
                    </div>

                    {/* ─── OTP Section ──────────────────────────────────── */}
                    {state === "OTP_SENT" && (
                        <div className="border border-amber-500/30 bg-amber-500/10 rounded-xl p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-amber-400" />
                                <h3 className="text-amber-400 font-semibold">
                                    Security Verification Required
                                </h3>
                            </div>
                            <p className="text-slate-400 text-sm">
                                A 6-digit code has been sent to your registered email address.
                                Enter it below to confirm this transfer.
                            </p>

                            {/* OTP Inputs */}
                            <OtpInput value={otpCode} onChange={setOtpCode} />

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={reset}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleTransfer}
                                    disabled={otpCode.length !== 6 || isTransferring}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                                >
                                    {isTransferring ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Confirm Transfer
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ─── Request OTP Button ───────────────────────────── */}
                    {state === "IDLE" && (
                        <Button
                            onClick={handleRequestOtp}
                            disabled={isRequestingOtp}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 text-base"
                        >
                            {isRequestingOtp ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending verification code...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="mr-2 h-5 w-5" />
                                    Continue & Verify
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="flex items-start gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
                <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                    <p className="text-slate-300 text-sm font-medium">Your transfer is protected</p>
                    <p className="text-slate-500 text-xs mt-1">
                        All transfers are encrypted, require OTP verification, and are
                        logged for your security. Contact support if you notice any
                        suspicious activity.
                    </p>
                </div>
            </div>
        </div>
    )
}

// ─── Sub Components ───────────────────────────────────────────

function Step({
    number,
    label,
    active,
    done,
}: {
    number: number
    label: string
    active: boolean
    done: boolean
}) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${done
                    ? "bg-green-600 text-white"
                    : active
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-500"
                    }`}
            >
                {done ? "✓" : number}
            </div>
            <span
                className={`text-xs whitespace-nowrap ${active ? "text-blue-400" : done ? "text-green-400" : "text-slate-600"
                    }`}
            >
                {label}
            </span>
        </div>
    )
}

function OtpInput({
    value,
    onChange,
}: {
    value: string
    onChange: (val: string) => void
}) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const digits = value.padEnd(6, " ").split("")

    const handleChange = (index: number, char: string) => {
        if (!/^[0-9]?$/.test(char)) return

        const arr = value.padEnd(6, " ").split("")
        arr[index] = char || " "
        const newValue = arr.join("").trimEnd()
        onChange(newValue)

        // ✅ Auto-focus next input on type
        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // ✅ Move back on backspace
        if (e.key === "Backspace") {
            e.preventDefault()
            const arr = value.padEnd(6, " ").split("")
            if (arr[index].trim()) {
                // Clear current
                arr[index] = " "
                onChange(arr.join("").trimEnd())
            } else if (index > 0) {
                // Clear previous and move back
                arr[index - 1] = " "
                onChange(arr.join("").trimEnd())
                inputRefs.current[index - 1]?.focus()
            }
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (!pasted) return
        onChange(pasted)
        inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }

    return (
        <div className="flex gap-3 justify-center">
            {digits.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit.trim()}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="w-11 h-13 text-center text-xl font-bold rounded-lg bg-slate-800 border-2 border-slate-600 text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
            ))}
        </div>
    )
}

function ReceiptRow({
    label,
    value,
    mono,
    highlight,
    success,
}: {
    label: string
    value: string
    mono?: boolean
    highlight?: boolean
    success?: boolean
}) {
    return (
        <div className="flex items-center justify-between py-1 border-b border-slate-700/50 last:border-0">
            <span className="text-slate-400 text-sm">{label}</span>
            <span
                className={`text-sm font-medium ${highlight
                    ? "text-blue-400 text-base font-bold"
                    : success
                        ? "text-green-400"
                        : "text-white"
                    } ${mono ? "font-mono" : ""}`}
            >
                {value}
            </span>
        </div>
    )
}

function ErrorMessage({ message }: { message: string }) {
    return (
        <p className="text-red-400 text-sm flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {message}
        </p>
    )
}