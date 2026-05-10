// hooks/use-transfer.ts
"use client"

import { useState } from "react"
import { toast } from "sonner"

type TransferState = "IDLE" | "OTP_SENT" | "SUCCESS"

type TransferPayload = {
    receiverAccountNumber: string
    amount: number
    currency: "USD" | "KHR"
    description?: string
    otpCode: string
}

export function useTransfer() {
    const [state, setState] = useState<TransferState>("IDLE")
    const [isRequestingOtp, setIsRequestingOtp] = useState(false)
    const [isTransferring, setIsTransferring] = useState(false)

    // ─── Request OTP ─────────────────────────────────────────
    const requestOtp = async () => {
        setIsRequestingOtp(true)
        try {
            const res = await fetch("/api/transactions/request-otp", {
                method: "POST",
            })
            const result = await res.json()

            if (!result.success) {
                toast.error(result.message)
                return false
            }

            toast.success(result.message)
            setState("OTP_SENT")
            return true
        } catch {
            toast.error("Failed to send OTP. Please try again.")
            return false
        } finally {
            setIsRequestingOtp(false)
        }
    }

    // ─── Execute Transfer ─────────────────────────────────────
    const executeTransfer = async (payload: TransferPayload) => {
        setIsTransferring(true)
        try {
            const res = await fetch("/api/transactions/transfer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const result = await res.json()

            if (!result.success) {
                toast.error(result.message)
                return null
            }

            setState("SUCCESS")
            toast.success(result.message)
            return result.data
        } catch {
            toast.error("Transfer failed. Please try again.")
            return null
        } finally {
            setIsTransferring(false)
        }
    }

    const reset = () => setState("IDLE")

    return {
        state,
        isRequestingOtp,
        isTransferring,
        requestOtp,
        executeTransfer,
        reset,
    }
}