import React, { useState } from "react"
import { register } from "../lib/api"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Card, CardContent, CardHeader } from "./ui/Card"
import { toast } from "sonner"

export const SignupForm: React.FC = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        setError("")

        const res = await register(email, password)
        if (res.success) {
            toast.success("註冊成功，請登入")
            window.location.href = "/login"
        } else {
            setError(res.error || "Signup failed")
            toast.error(res.error || "Signup failed")
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto mt-10">
            <CardHeader>
                <h1 className="text-2xl font-bold text-center">註冊</h1>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="密碼"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "註冊中..." : "註冊"}
                    </Button>
                    <div className="text-center text-sm text-gray-600">
                        已有帳號？ <a href="/login" className="text-blue-600 hover:underline">登入</a>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
