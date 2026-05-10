"use server"

import { BakongKHQR, IndividualInfo, khqrData } from "bakong-khqr"

export interface GenerateKHQRResult {
    qr: string
    md5: string
}

export async function generateKHQRAction(
    accountNumber: string,
    accountName: string,
    amount?: number,
    currency: "USD" | "KHR" = "USD"
): Promise<{ success: true; data: GenerateKHQRResult } | { success: false; error: string }> {
    try {
        // Strip dashes: "1234-5678-9012" → "123456789012"
        const sanitizedAccount = accountNumber.replace(/-/g, "")

        // Bakong account ID format: "username@bankidentifier"
        // We use the account number as the unique identifier
        const bakongAccountID = `${sanitizedAccount}@khmerbank`

        // Merchant name: max 25 chars, uppercase per EMV spec
        const merchantName = accountName.slice(0, 25).toUpperCase()

        const optional: Record<string, unknown> = {
            currency: currency === "USD" ? khqrData.currency.usd : khqrData.currency.khr,
        }

        // Only include amount if provided and greater than 0
        if (amount && amount > 0) {
            optional.amount = amount
        }

        const individualInfo = new IndividualInfo(
            bakongAccountID,
            merchantName,
            "Phnom Penh",
            optional
        )

        const khqr = new BakongKHQR()
        const response = khqr.generateIndividual(individualInfo)

        // SDK returns { data: { qr, md5 }, status } on success
        // or { status: { code, errorMessage } } on failure
        if (response?.status?.code !== 0 || !response?.data?.qr) {
            return {
                success: false,
                error: response?.status?.errorMessage ?? "Failed to generate KHQR",
            }
        }

        return {
            success: true,
            data: {
                qr: response.data.qr,
                md5: response.data.md5,
            },
        }
    } catch (err) {
        console.error("[KHQR_GENERATE_ERROR]", err)
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
        }
    }
}