"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { decodeToken } from "@/lib/utils/decodeToken";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState("");
    const [tempToken, setTempToken] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, purpose: "reset" })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send code");
            setTempToken(data.tempToken);
            setStep("code");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setLoading(true);
        setError("");
        try {
            const userInfo = await decodeToken(tempToken);
            if (!userInfo || userInfo.code !== code) throw new Error("Invalid code");

            const res = await fetch("/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tempToken, code, newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.back();
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
                    <CardTitle>Reset Password</CardTitle>
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
                            <Input
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <Button onClick={handleReset} disabled={loading} className="w-full">
                                {loading ? "Resetting..." : "Reset Password"}
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