"use client"

import {useState} from "react"
import {useForm} from "react-hook-form"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Form, FormField, FormItem, FormControl, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Eye, EyeOff} from "lucide-react"
import {useRouter} from "next/navigation"
import {useAuthStore, useUserStore} from "@/lib/store"
import {decodeToken} from "@/lib/utils/decodeToken";

interface LoginFormInputs {
    username: string
    password: string
}

export default function LoginForm() {
    const setToken = useAuthStore((state) => state.setToken)
    //const setUser = useUserStore((state) => state.setUser);

    const form = useForm<LoginFormInputs>({
        defaultValues: {
            username: "",
            password: "",
        },
    })
    const [apiError, setApiError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    async function onSubmit(data: LoginFormInputs) {
        setLoading(true)
        setApiError(null)

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                setApiError(result.error || "Login failed.")
                return
            }

            setToken(result.token)
            const user = await decodeToken(result.token);
            //setUser({ _id: user?.id as string, username: user?.username as string, role: user?.role as string });

            router.back();
        } catch (error) {
            console.error("Login error:", error)
            setApiError("Unexpected error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="username"
                                rules={{required: "Username is required"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your username" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                rules={{required: "Password is required"}}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    {...field}
                                                    className="pr-10" // espacio extra para el icono
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5"/>
                                                    ) : (
                                                        <Eye className="h-5 w-5"/>
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {apiError && (
                                <Alert variant="destructive">
                                    <AlertDescription>{apiError}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
