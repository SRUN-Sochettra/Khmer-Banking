// lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from "nanoid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Account Number Generator ───────────────────────────────
// Format: 1234-5678-9012  (12 digits like real banks)
export function generateAccountNumber(): string {
  const numeric = customAlphabet("0123456789", 12)
  const raw = numeric()
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`
}

// ─── OTP Generator ──────────────────────────────────────────
export function generateOtpCode(): string {
  const numeric = customAlphabet("0123456789", 6)
  return numeric()
}

// ─── Transaction Reference Generator ────────────────────────
// Format: TXN-20240115-ABCD1234
export function generateTransactionReference(): string {
  const alpha = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8)
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  return `TXN-${date}-${alpha()}`
}

// ─── Currency Formatter ──────────────────────────────────────
export function formatCurrency(
  amount: number | string,
  currency: "USD" | "KHR" = "USD"
): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount

  if (currency === "KHR") {
    return new Intl.NumberFormat("km-KH", {
      style: "currency",
      currency: "KHR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// ─── Date Formatter ──────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

// ─── Mask Account Number ─────────────────────────────────────
// 1234-5678-9012 → ****-****-9012
export function maskAccountNumber(accountNumber: string): string {
  const parts = accountNumber.split("-")
  return `****-****-${parts[2]}`
}

// ─── API Response Helpers ────────────────────────────────────
export function successResponse<T>(data: T, message?: string) {
  return {
    success: true,
    message: message ?? "Success",
    data,
  }
}

export function errorResponse(message: string, errors?: unknown) {
  return {
    success: false,
    message,
    errors,
  }
}