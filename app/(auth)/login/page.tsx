// app/(auth)/login/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema, type LoginInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Eye, EyeOff, Loader2, Building2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
    })

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true)
        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            })

            if (result?.error) {
                toast.error("Invalid email or password. Please try again.")
                return
            }

            toast.success("Welcome back!")
            router.push("/dashboard")
            router.refresh()
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
                        <CardTitle className="text-2xl text-foreground">Welcome back</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Sign in to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

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

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-foreground">
                                        Password
                                    </Label>
                                    <Link
                                        href="/forget-password"
                                        className="text-primary hover:text-primary/80 text-sm"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="bg-muted border-input text-foreground placeholder:text-muted-foreground pr-10"
                                        {...register("password")}
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
                                {errors.password && (
                                    <p className="text-destructive text-sm">{errors.password.message}</p>
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
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>

                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <p className="text-muted-foreground text-sm text-center w-full">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                                Create one
                            </Link>
                        </p>

                        {/* Security Badge */}
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <span>256-bit SSL encrypted. Your data is secure.</span>
                        </div>
                    </CardFooter>
                </Card>

            </div>
        </div>
    )
}