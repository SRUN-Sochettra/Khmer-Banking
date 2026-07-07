// app/(auth)/register/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { RegisterSchema, type RegisterInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2, Building2 } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
    })

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (!result.success) {
                toast.error(result.message)
                return
            }

            // Store userId temporarily to use in OTP verification
            sessionStorage.setItem("pendingUserId", result.data.userId)
            sessionStorage.setItem("pendingEmail", result.data.email)

            toast.success(result.message)
            router.push("/verify-otp")
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

                <Card className="border-input bg-muted/50 backdrop-blur">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-foreground">Create account</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Open your digital banking account today
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-foreground">
                                    Full Name
                                </Label>
                                <Input
                                    id="fullName"
                                    placeholder="Sokha Chan"
                                    className="bg-muted border-input text-foreground placeholder:text-muted-foreground"
                                    {...register("fullName")}
                                />
                                {errors.fullName && (
                                    <p className="text-destructive text-sm">{errors.fullName.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground">
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
                                    <p className="text-destructive text-sm">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-foreground">
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="012 345 678"
                                    className="bg-muted border-input text-foreground placeholder:text-muted-foreground"
                                    {...register("phone")}
                                />
                                {errors.phone && (
                                    <p className="text-destructive text-sm">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-foreground">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 8 chars, uppercase & symbol"
                                        className="bg-muted border-input text-foreground placeholder:text-muted-foreground pr-10"
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-destructive text-sm">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-foreground">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Re-enter your password"
                                        className="bg-muted border-input text-foreground placeholder:text-muted-foreground pr-10"
                                        {...register("confirmPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
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
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>

                        </form>
                    </CardContent>

                    <CardFooter>
                        <p className="text-muted-foreground text-sm text-center w-full">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

            </div>
        </div>
    )
}