import { z } from "zod"

export const RegisterSchema = z
    .object({
        fullName: z
            .string()
            .min(2, "Full name must be at least 2 characters")
            .max(100, "Full name is too long"),

        email: z.string().email("Please enter a valid email address"),

        // ✅ No .transform().pipe() - validate raw, normalize on submit
        phone: z
            .string()
            .min(1, "Phone number is required")
            .transform((val) => val.replace(/\s+/g, ""))
            .refine(
                (val) => /^(\+855|0)[0-9]{8,9}$/.test(val),
                "Please enter a valid Cambodian phone number (e.g., 012 345 678)"
            )
            .transform((val) =>
                val.startsWith("0") ? `+855${val.slice(1)}` : val
            ),

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

export const LoginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

export const OtpSchema = z.object({
    code: z
        .string()
        .length(6, "OTP must be 6 digits")
        .regex(/^[0-9]+$/, "OTP must contain only numbers"),
})

export const TransferSchema = z.object({
    receiverAccountNumber: z.string().min(1, "Account number is required"),

    amount: z
        .number()
        .positive("Amount must be positive")
        .min(0.01, "Minimum transfer is $0.01")
        .max(50000, "Maximum transfer is $50,000"),

    currency: z.enum(["USD", "KHR"]),

    description: z.string().max(255, "Description is too long").optional(),

    otpCode: z.string().length(6, "OTP must be 6 digits"),
})

export type RegisterInput = z.input<typeof RegisterSchema>  // ✅ use z.input not z.infer
export type LoginInput = z.infer<typeof LoginSchema>
export type OtpInput = z.infer<typeof OtpSchema>
export type TransferInput = z.infer<typeof TransferSchema>