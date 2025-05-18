"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/lib/store";
import { decodeToken } from "@/lib/utils/decodeToken";

export default function EmailLoginPage() {
    const router = useRouter();
    const setToken = useAuthStore((state) => state.setToken);
    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState("");
    const [tempToken, setTempToken] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            console.log("Antes de enivar code")
            const res = await fetch("/api/auth/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, purpose: "login" })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send code");
            console.log("Temp Token: ", data.tempToken)
            setTempToken(data.tempToken);
            setStep("code");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            console.log("Antes de decode",tempToken)
            const userInfo = await decodeToken(tempToken);
            console.log("Despues: ",userInfo);
            if (!userInfo || userInfo.code !== code) {
                throw new Error("Invalid code");
            }

            const res = await fetch("/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tempToken, code })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setToken(data.token);
            router.replace("/");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-md mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Email Login</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === "email" ? (
                        <>
                            <Input
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button onClick={handleEmailSubmit} disabled={loading} className="w-full">
                                {loading ? "Sending..." : "Send Code"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Input
                                placeholder="Enter the code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <Button onClick={handleCodeSubmit} disabled={loading} className="w-full">
                                {loading ? "Verifying..." : "Verify Code"}
                            </Button>
                        </>
                    )}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
